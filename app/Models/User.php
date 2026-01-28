<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'invited_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'status' => UserStatus::class,
        ];
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function invitedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'invited_by');
    }

    public function allowedGroups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'user_group_permissions');
    }

    public function createdInvitationCodes(): HasMany
    {
        return $this->hasMany(InvitationCode::class, 'created_by');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'sent_by');
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isOperator(): bool
    {
        return $this->role === UserRole::Operator;
    }

    public function isActive(): bool
    {
        return $this->status === UserStatus::Active;
    }

    public function isPending(): bool
    {
        return $this->status === UserStatus::Pending;
    }

    public function canAccessGroup(Group $group): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->allowedGroups()->where('groups.id', $group->id)->exists();
    }
}
