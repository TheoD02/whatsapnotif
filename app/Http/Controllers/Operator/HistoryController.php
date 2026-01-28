<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $query = Notification::with('sender')
            ->withCount('recipients');

        if (! $user->isAdmin()) {
            $query->where('sent_by', $user->id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $notifications = $query->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('operator/history/Index', [
            'notifications' => $notifications,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function show(Notification $notification): Response
    {
        $user = auth()->user();

        if (! $user->isAdmin() && $notification->sent_by !== $user->id) {
            abort(403);
        }

        $notification->load(['recipients.contact', 'sender', 'template']);

        $stats = [
            'total' => $notification->recipients()->count(),
            'sent' => $notification->recipients()->where('status', 'sent')->count(),
            'delivered' => $notification->recipients()->where('status', 'delivered')->count(),
            'failed' => $notification->recipients()->where('status', 'failed')->count(),
            'pending' => $notification->recipients()->where('status', 'pending')->count(),
        ];

        return Inertia::render('operator/history/Show', [
            'notification' => $notification,
            'stats' => $stats,
        ]);
    }
}
