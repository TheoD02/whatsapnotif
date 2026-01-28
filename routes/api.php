<?php

use App\Http\Controllers\Api;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware(\App\Http\Middleware\AuthenticateApiToken::class)->group(function () {
    // Notifications
    Route::post('/notifications/send', [Api\NotificationController::class, 'send']);

    // Contacts
    Route::get('/contacts', [Api\ContactController::class, 'index']);
    Route::post('/contacts', [Api\ContactController::class, 'store']);
    Route::get('/contacts/{contact}', [Api\ContactController::class, 'show']);
    Route::put('/contacts/{contact}', [Api\ContactController::class, 'update']);

    // Groups & Templates
    Route::get('/groups', [Api\ContactController::class, 'groups']);
    Route::get('/templates', [Api\ContactController::class, 'templates']);
});
