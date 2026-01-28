<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Group;
use App\Models\Notification;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'pending_users' => User::where('status', 'pending')->count(),
            'active_users' => User::where('status', 'active')->count(),
            'contacts' => Contact::count(),
            'groups' => Group::count(),
            'notifications_today' => Notification::whereDate('created_at', today())->count(),
            'notifications_week' => Notification::where('created_at', '>=', now()->subWeek())->count(),
        ];

        $recentNotifications = Notification::with('sender')
            ->latest()
            ->take(5)
            ->get();

        $pendingUsers = User::where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('admin/Dashboard', [
            'stats' => $stats,
            'recentNotifications' => $recentNotifications,
            'pendingUsers' => $pendingUsers,
        ]);
    }
}
