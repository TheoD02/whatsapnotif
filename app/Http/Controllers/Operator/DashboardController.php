<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $stats = [
            'notifications_sent' => Notification::where('sent_by', $user->id)->count(),
            'notifications_today' => Notification::where('sent_by', $user->id)
                ->whereDate('created_at', today())
                ->count(),
            'notifications_week' => Notification::where('sent_by', $user->id)
                ->where('created_at', '>=', now()->subWeek())
                ->count(),
        ];

        $recentNotifications = Notification::where('sent_by', $user->id)
            ->withCount('recipients')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('operator/Dashboard', [
            'stats' => $stats,
            'recentNotifications' => $recentNotifications,
        ]);
    }
}
