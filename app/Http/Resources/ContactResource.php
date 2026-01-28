<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Contact
 */
class ContactResource extends JsonResource
{
    /**
     * @return array{
     *   id: int,
     *   name: string,
     *   phone: ?string,
     *   preferred_channel: 'whatsapp'|'telegram',
     *   telegram_chat_id: ?string,
     *   is_active: bool,
     *   metadata: array<string, mixed>,
     *   groups: GroupResource[],
     *   created_at: string,
     *   updated_at: string
     * }
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'preferred_channel' => $this->preferred_channel,
            'telegram_chat_id' => $this->telegram_chat_id,
            'is_active' => $this->is_active,
            'metadata' => $this->metadata ?? [],
            'groups' => GroupResource::collection($this->whenLoaded('groups')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
