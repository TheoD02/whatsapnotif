<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendNotificationJob;
use App\Models\Contact;
use App\Models\Group;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:4096'],
            'template_id' => ['nullable', 'exists:message_templates,id'],
            'template_data' => ['nullable', 'array'],
            'recipients' => ['required', 'array'],
            'recipients.contact_ids' => ['nullable', 'array'],
            'recipients.contact_ids.*' => ['exists:contacts,id'],
            'recipients.group_ids' => ['nullable', 'array'],
            'recipients.group_ids.*' => ['exists:groups,id'],
            'recipients.phones' => ['nullable', 'array'],
            'recipients.phones.*' => ['string', 'max:20'],
            'channel' => ['nullable', 'in:whatsapp,sms,telegram,email'],
        ]);

        $apiToken = $request->api_token;
        $user = $apiToken->creator;

        // Handle phone numbers: create contacts on the fly
        $phoneContactIds = [];
        if (!empty($validated['recipients']['phones'])) {
            foreach ($validated['recipients']['phones'] as $phone) {
                $phone = Contact::formatPhone($phone);
                $contact = Contact::firstOrCreate(
                    ['phone' => $phone],
                    ['name' => 'API Contact ' . substr($phone, -4)]
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
            return response()->json([
                'error' => 'Au moins un destinataire est requis',
            ], 422);
        }

        $content = $validated['content'];

        // Apply template if provided
        if (!empty($validated['template_id'])) {
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

        return response()->json([
            'success' => true,
            'notification_id' => $notification->id,
            'recipients_count' => $notification->recipients()->count(),
        ], 201);
    }
}
