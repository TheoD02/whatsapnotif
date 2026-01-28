<?php

namespace App\Models;

use App\Enums\MessagingChannel;
use App\Enums\NotificationStatus;
use App\Enums\RecipientStatus;
use App\Events\NotificationStatusUpdated;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'template_id',
        'channel',
        'status',
        'sent_by',
        'sent_at',
        'scheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'scheduled_at' => 'datetime',
            'channel' => MessagingChannel::class,
            'status' => NotificationStatus::class,
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(MessageTemplate::class, 'template_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }

    public function getSuccessRate(): float
    {
        $total = $this->recipients()->count();
        if ($total === 0) {
            return 0;
        }

        $successful = $this->recipients()
            ->whereIn('status', [RecipientStatus::Sent->value, RecipientStatus::Delivered->value])
            ->count();

        return round(($successful / $total) * 100, 1);
    }

    public function markAsSending(): void
    {
        $this->update(['status' => NotificationStatus::Sending]);

        broadcast(new NotificationStatusUpdated($this))->toOthers();
    }

    public function markAsCompleted(): void
    {
        $failed = $this->recipients()->where('status', RecipientStatus::Failed)->count();
        $total = $this->recipients()->count();

        if ($failed === $total) {
            $status = NotificationStatus::Failed;
        } elseif ($failed > 0) {
            $status = NotificationStatus::Partial;
        } else {
            $status = NotificationStatus::Sent;
        }

        $this->update([
            'status' => $status,
            'sent_at' => now(),
        ]);

        broadcast(new NotificationStatusUpdated($this))->toOthers();
    }
}
