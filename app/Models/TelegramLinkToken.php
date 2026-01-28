<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TelegramLinkToken extends Model
{
    protected $fillable = [
        'token',
        'code',
        'contact_id',
        'telegram_chat_id',
        'status',
        'linked_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'linked_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public static function generateForContact(Contact $contact, int $expiresInMinutes = 30): self
    {
        // Expire any existing pending tokens for this contact
        self::where('contact_id', $contact->id)
            ->where('status', 'pending')
            ->update(['status' => 'expired']);

        return self::create([
            'token' => Str::random(32),
            'code' => strtoupper(Str::random(6)),
            'contact_id' => $contact->id,
            'expires_at' => now()->addMinutes($expiresInMinutes),
        ]);
    }

    public function isValid(): bool
    {
        return $this->status === 'pending' && $this->expires_at->isFuture();
    }

    public function markAsLinked(string $chatId): void
    {
        $this->update([
            'status' => 'linked',
            'telegram_chat_id' => $chatId,
            'linked_at' => now(),
        ]);

        // Update the contact with the chat_id
        $this->contact->update([
            'telegram_chat_id' => $chatId,
            'preferred_channel' => 'telegram',
        ]);
    }

    public function getDeepLink(): string
    {
        $botUsername = config('services.telegram.bot_username');

        return "https://t.me/{$botUsername}?start={$this->token}";
    }
}
