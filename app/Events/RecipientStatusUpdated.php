<?php

namespace App\Events;

use App\Models\NotificationRecipient;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RecipientStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public NotificationRecipient $recipient
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications.' . $this->recipient->notification_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'recipient.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->recipient->id,
            'notification_id' => $this->recipient->notification_id,
            'contact_id' => $this->recipient->contact_id,
            'status' => $this->recipient->status,
            'error_message' => $this->recipient->error_message,
            'sent_at' => $this->recipient->sent_at?->toISOString(),
        ];
    }
}
