<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SendNotificationRequest;
use App\Http\Resources\NotificationSentResource;
use App\Jobs\SendNotificationJob;
use App\Models\Contact;
use App\Services\NotificationService;

/**
 * @tags Notifications
 */
class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Envoyer une notification
     *
     * Envoie une notification à un ou plusieurs destinataires via WhatsApp ou Telegram.
     * Les messages sont mis en file d'attente et envoyés de manière asynchrone.
     *
     * @operationId sendNotification
     */
    public function send(SendNotificationRequest $request): NotificationSentResource
    {
        $validated = $request->validated();
        $apiToken = $request->api_token;
        $user = $apiToken->creator;

        // Handle phone numbers: create contacts on the fly
        $phoneContactIds = [];
        if (! empty($validated['recipients']['phones'])) {
            foreach ($validated['recipients']['phones'] as $phone) {
                $phone = Contact::formatPhone($phone);
                $contact = Contact::firstOrCreate(
                    ['phone' => $phone],
                    ['name' => 'API Contact '.substr($phone, -4)]
                );
                $phoneContactIds[] = $contact->id;
            }
        }

        $contactIds = array_merge(
            $validated['recipients']['contact_ids'] ?? [],
            $phoneContactIds
        );
        $groupIds = $validated['recipients']['group_ids'] ?? [];

        if (empty($contactIds) && empty($groupIds)) {
            abort(422, 'Au moins un destinataire est requis');
        }

        $content = $validated['content'];

        // Apply template if provided
        if (! empty($validated['template_id'])) {
            $template = \App\Models\MessageTemplate::find($validated['template_id']);
            if ($template) {
                $content = $template->render($validated['template_data'] ?? []);
            }
        }

        $notification = $this->notificationService->create(
            user: $user,
            content: $content,
            contactIds: $contactIds,
            groupIds: $groupIds,
            templateId: $validated['template_id'] ?? null,
            channel: $validated['channel'] ?? 'whatsapp'
        );

        $notification->update(['status' => 'queued']);
        SendNotificationJob::dispatch($notification);

        return new NotificationSentResource($notification);
    }
}
