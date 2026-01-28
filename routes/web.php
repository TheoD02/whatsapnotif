<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth;
use App\Http\Controllers\Operator;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return auth()->user()->isAdmin()
            ? redirect('/admin')
            : redirect('/dashboard');
    }
    return Inertia::render('Welcome');
});

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [Auth\LoginController::class, 'create'])->name('login');
    Route::post('/login', [Auth\LoginController::class, 'store']);
    Route::get('/register', [Auth\RegisterController::class, 'create'])->name('register');
    Route::post('/register', [Auth\RegisterController::class, 'store']);
});

// Auth routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [Auth\LoginController::class, 'destroy'])->name('logout');
    Route::get('/pending-approval', function () {
        if (auth()->user()->isActive()) {
            return redirect('/dashboard');
        }
        return Inertia::render('auth/PendingApproval');
    })->name('pending-approval');
});

// Admin routes
Route::middleware(['auth', \App\Http\Middleware\EnsureUserIsApproved::class, \App\Http\Middleware\EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

        // Users
        Route::get('/users', [Admin\UserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [Admin\UserController::class, 'show'])->name('users.show');
        Route::post('/users/{user}/approve', [Admin\UserController::class, 'approve'])->name('users.approve');
        Route::post('/users/{user}/reject', [Admin\UserController::class, 'reject'])->name('users.reject');
        Route::put('/users/{user}/role', [Admin\UserController::class, 'updateRole'])->name('users.update-role');
        Route::put('/users/{user}/groups', [Admin\UserController::class, 'updateGroups'])->name('users.update-groups');
        Route::delete('/users/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');

        // Invitations
        Route::get('/invitations', [Admin\InvitationController::class, 'index'])->name('invitations.index');
        Route::post('/invitations', [Admin\InvitationController::class, 'store'])->name('invitations.store');
        Route::delete('/invitations/{invitation}', [Admin\InvitationController::class, 'destroy'])->name('invitations.destroy');

        // Contacts
        Route::resource('contacts', Admin\ContactController::class);
        Route::post('/contacts/import', [Admin\ContactController::class, 'import'])->name('contacts.import');
        Route::post('/contacts/test-message', [Admin\ContactController::class, 'testMessage'])->name('contacts.test-message');

        // Telegram Link
        Route::post('/contacts/{contact}/telegram-link', [Admin\TelegramLinkController::class, 'generate'])->name('contacts.telegram-link.generate');
        Route::get('/contacts/{contact}/telegram-link/status', [Admin\TelegramLinkController::class, 'status'])->name('contacts.telegram-link.status');
        Route::get('/contacts/{contact}/telegram-link/check', [Admin\TelegramLinkController::class, 'checkPending'])->name('contacts.telegram-link.check');

        // Groups
        Route::resource('groups', Admin\GroupController::class);

        // Templates
        Route::resource('templates', Admin\TemplateController::class);

        // API Tokens
        Route::get('/api-tokens', [Admin\ApiTokenController::class, 'index'])->name('api-tokens.index');
        Route::post('/api-tokens', [Admin\ApiTokenController::class, 'store'])->name('api-tokens.store');
        Route::delete('/api-tokens/{apiToken}', [Admin\ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

        // WhatsApp Connection
        Route::get('/whatsapp', [Admin\WhatsAppController::class, 'index'])->name('whatsapp.index');
        Route::get('/whatsapp/status', [Admin\WhatsAppController::class, 'status'])->name('whatsapp.status');
        Route::post('/whatsapp/logout', [Admin\WhatsAppController::class, 'logout'])->name('whatsapp.logout');
        Route::post('/whatsapp/reconnect', [Admin\WhatsAppController::class, 'reconnect'])->name('whatsapp.reconnect');

        // Documentation
        Route::get('/documentation/{page?}', [Admin\DocumentationController::class, 'index'])->name('documentation');
    });

// Operator routes
Route::middleware(['auth', \App\Http\Middleware\EnsureUserIsApproved::class])
    ->group(function () {
        Route::get('/dashboard', [Operator\DashboardController::class, 'index'])->name('dashboard');

        // Notifications
        Route::get('/notifications/create', [Operator\NotificationController::class, 'create'])->name('notifications.create');
        Route::post('/notifications', [Operator\NotificationController::class, 'store'])->name('notifications.store');
        Route::post('/notifications/test', [Operator\NotificationController::class, 'test'])->name('notifications.test');
        Route::get('/notifications/{notification}', [Operator\NotificationController::class, 'show'])->name('notifications.show');

        // History
        Route::get('/history', [Operator\HistoryController::class, 'index'])->name('history.index');
        Route::get('/history/{notification}', [Operator\HistoryController::class, 'show'])->name('history.show');
    });
