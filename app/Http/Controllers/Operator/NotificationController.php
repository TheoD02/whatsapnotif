<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Jobs\SendNotificationJob;
use App\Models\Contact;
use App\Models\Group;
use App\Models\MessageTemplate;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function create(): Response
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            $groups = Group::withCount('contacts')->orderBy('name')->get();
        } else {
            $groups = $user->allowedGroups()->withCount('contacts')->orderBy('name')->get();
        }

        $groupIds = $groups->pluck('id');
        $contacts = Contact::whereHas('groups', function ($query) use ($groupIds) {
            $query->whereIn('groups.id', $groupIds);
        })->where('is_active', true)->orderBy('name')->get();

        $templates = MessageTemplate::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('operator/notifications/Create', [
            'groups' => $groups,
            'contacts' => $contacts,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:4096'],
            'template_id' => ['nullable', 'exists:message_templates,id'],
            'contact_ids' => ['nullable', 'array'],
            'contact_ids.*' => ['exists:contacts,id'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['exists:groups,id'],
        ]);

        if (empty($validated['contact_ids']) && empty($validated['group_ids'])) {
            return back()->withErrors(['recipients' => 'Veuillez sélectionner au moins un destinataire.']);
        }

        $user = auth()->user();

        // Verify user has permission to send to these groups
        if (!$user->isAdmin() && !empty($validated['group_ids'])) {
            $allowedGroupIds = $user->allowedGroups()->pluck('id')->toArray();
            foreach ($validated['group_ids'] as $groupId) {
                if (!in_array($groupId, $allowedGroupIds)) {
                    return back()->withErrors(['group_ids' => 'Vous n\'avez pas accès à ce groupe.']);
                }
            }
        }

        $notification = $this->notificationService->create(
            user: $user,
            content: $validated['content'],
            contactIds: $validated['contact_ids'] ?? [],
            groupIds: $validated['group_ids'] ?? [],
            templateId: $validated['template_id'] ?? null,
            title: $validated['title'] ?? null,
        );

        // Queue the notification
        $notification->update(['status' => 'queued']);
        SendNotificationJob::dispatch($notification);

        return redirect()->route('history.show', $notification)
            ->with('success', 'Notification envoyée avec succès.');
    }

    public function test(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'content' => ['required', 'string', 'max:4096'],
        ]);

        $result = $this->notificationService->sendTest(
            $validated['phone'],
            $validated['content']
        );

        return response()->json($result);
    }

    public function show(Notification $notification): Response
    {
        $notification->load(['recipients.contact', 'sender', 'template']);

        return Inertia::render('operator/notifications/Show', [
            'notification' => $notification,
        ]);
    }
}
