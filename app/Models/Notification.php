<?php

namespace App\Models;

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

        $successful = $this->recipients()->whereIn('status', ['sent', 'delivered'])->count();
        return round(($successful / $total) * 100, 1);
    }

    public function markAsSending(): void
    {
        $this->update(['status' => 'sending']);
    }

    public function markAsCompleted(): void
    {
        $failed = $this->recipients()->where('status', 'failed')->count();
        $total = $this->recipients()->count();

        if ($failed === $total) {
            $status = 'failed';
        } elseif ($failed > 0) {
            $status = 'partial';
        } else {
            $status = 'sent';
        }

        $this->update([
            'status' => $status,
            'sent_at' => now(),
        ]);
    }
}
