<?php

namespace App\Services;

use App\Contracts\MessagingChannel;
use App\Models\Contact;
use App\Models\Group;
use App\Models\MessageTemplate;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\User;
use App\Services\Messaging\MockChannel;
use App\Services\Messaging\TelegramChannel;
use App\Services\Messaging\WhatsAppBaileysChannel;
use App\Services\Messaging\WhatsAppCloudChannel;
use Illuminate\Support\Collection;

class NotificationService
{
    private MessagingChannel $defaultWhatsAppChannel;

    public function __construct()
    {
        $this->defaultWhatsAppChannel = $this->resolveWhatsAppChannel();
    }

    private function resolveWhatsAppChannel(): MessagingChannel
    {
        $channelName = config('services.messaging.default', 'mock');

        return match ($channelName) {
            'whatsapp' => new WhatsAppCloudChannel(),
            'whatsapp_baileys' => new WhatsAppBaileysChannel(),
            default => new MockChannel(),
        };
    }

    private function getChannelForContact(Contact $contact): MessagingChannel
    {
        return match ($contact->preferred_channel) {
            'telegram' => new TelegramChannel(),
            default => $this->defaultWhatsAppChannel,
        };
    }

    public function create(
        User $user,
        string $content,
        array $contactIds = [],
        array $groupIds = [],
        ?int $templateId = null,
        ?string $title = null,
        string $channel = 'whatsapp'
    ): Notification {
        $notification = Notification::create([
            'title' => $title,
            'content' => $content,
            'template_id' => $templateId,
            'channel' => $channel,
            'status' => 'draft',
            'sent_by' => $user->id,
        ]);

        $contacts = $this->resolveRecipients($contactIds, $groupIds);

        foreach ($contacts as $contact) {
            NotificationRecipient::create([
                'notification_id' => $notification->id,
                'contact_id' => $contact->id,
                'status' => 'pending',
            ]);
        }

        return $notification;
    }

    public function resolveRecipients(array $contactIds = [], array $groupIds = []): Collection
    {
        $contacts = collect();

        if (!empty($contactIds)) {
            $contacts = $contacts->merge(
                Contact::whereIn('id', $contactIds)->where('is_active', true)->get()
            );
        }

        if (!empty($groupIds)) {
            $groupContacts = Contact::whereHas('groups', function ($query) use ($groupIds) {
                $query->whereIn('groups.id', $groupIds);
            })->where('is_active', true)->get();

            $contacts = $contacts->merge($groupContacts);
        }

        return $contacts->unique('id');
    }

    public function send(Notification $notification): void
    {
        $notification->markAsSending();

        $recipients = $notification->recipients()->with('contact')->get();

        foreach ($recipients as $recipient) {
            $this->sendToRecipient($notification, $recipient);
        }

        $notification->markAsCompleted();
    }

    public function sendToRecipient(Notification $notification, NotificationRecipient $recipient): void
    {
        $contact = $recipient->contact;

        if (!$contact || !$contact->is_active) {
            $recipient->markAsFailed('Contact inactif ou supprimé');
            return;
        }

        $channel = $this->getChannelForContact($contact);
        $identifier = $contact->getChannelIdentifier();

        if (empty($identifier)) {
            $recipient->markAsFailed('Identifiant de contact manquant');
            return;
        }

        $message = $this->personalizeMessage($notification->content, $contact);

        $result = $channel->send($identifier, $message);

        if ($result->success) {
            $recipient->markAsSent();
        } else {
            $recipient->markAsFailed($result->error ?? 'Erreur inconnue');
        }
    }

    public function sendTest(string $identifier, string $message, string $channel = 'whatsapp'): array
    {
        $channelInstance = match ($channel) {
            'telegram' => new TelegramChannel(),
            default => $this->defaultWhatsAppChannel,
        };

        $result = $channelInstance->send($identifier, $message);

        return [
            'success' => $result->success,
            'message_id' => $result->messageId,
            'error' => $result->error,
        ];
    }

    private function personalizeMessage(string $content, Contact $contact): string
    {
        $replacements = [
            'nom' => $contact->name,
            'name' => $contact->name,
            'phone' => $contact->phone,
            'telephone' => $contact->phone,
        ];

        // Add metadata fields
        foreach ($contact->metadata ?? [] as $key => $value) {
            $replacements[$key] = $value;
        }

        foreach ($replacements as $key => $value) {
            $content = preg_replace('/\{\{\s*' . preg_quote($key, '/') . '\s*\}\}/i', $value, $content);
        }

        return $content;
    }

    public function renderTemplate(MessageTemplate $template, array $data = []): string
    {
        return $template->render($data);
    }
}
