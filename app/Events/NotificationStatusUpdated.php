<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Notification $notification
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications.' . $this->notification->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'status' => $this->notification->status,
            'sent_at' => $this->notification->sent_at?->toISOString(),
        ];
    }
}
