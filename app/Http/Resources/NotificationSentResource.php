<?php

namespace App\Http\Resources;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Notification
 */
class NotificationSentResource extends JsonResource
{
    /**
     * @return array{
     *   success: bool,
     *   notification_id: int,
     *   recipients_count: int,
     *   message: string
     * }
     */
    public function toArray(Request $request): array
    {
        return [
            'success' => true,
            'notification_id' => $this->id,
            'recipients_count' => $this->recipients()->count(),
            'message' => "Notification envoyée à {$this->recipients()->count()} destinataire(s)",
        ];
    }
}
