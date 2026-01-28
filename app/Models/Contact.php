<?php

namespace App\Models;

use App\Enums\MessagingChannel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'metadata',
        'is_active',
        'preferred_channel',
        'telegram_chat_id',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'is_active' => 'boolean',
            'preferred_channel' => MessagingChannel::class,
        ];
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'contact_group');
    }

    public function notificationRecipients(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }

    public static function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        $defaultCountryCode = config('services.messaging.default_country_code', '+33');

        if (str_starts_with($phone, '0')) {
            $phone = $defaultCountryCode.substr($phone, 1);
        }

        if (! str_starts_with($phone, '+')) {
            $phone = '+'.$phone;
        }

        return $phone;
    }

    public function getChannelIdentifier(): ?string
    {
        return $this->preferred_channel === MessagingChannel::Telegram
            ? $this->telegram_chat_id
            : $this->phone;
    }
}
