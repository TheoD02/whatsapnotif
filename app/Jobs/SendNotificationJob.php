<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Notification $notification
    ) {}

    public function handle(NotificationService $service): void
    {
        $service->send($this->notification);
    }

    public function failed(\Throwable $exception): void
    {
        $this->notification->update(['status' => 'failed']);
    }
}
