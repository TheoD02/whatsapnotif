<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ApiToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'token_hash',
        'token_prefix',
        'abilities',
        'last_used_at',
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'abilities' => 'array',
            'last_used_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    protected $hidden = [
        'token_hash',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generate(User $creator, string $name, array $abilities = ['*']): array
    {
        $plainToken = Str::random(40);
        $prefix = substr($plainToken, 0, 8);

        $token = self::create([
            'name' => $name,
            'token_hash' => hash('sha256', $plainToken),
            'token_prefix' => $prefix,
            'abilities' => $abilities,
            'created_by' => $creator->id,
        ]);

        return [
            'token' => $token,
            'plain_token' => $plainToken,
        ];
    }

    public static function findByToken(string $plainToken): ?self
    {
        $hash = hash('sha256', $plainToken);

        return self::where('token_hash', $hash)->where('is_active', true)->first();
    }

    public function hasAbility(string $ability): bool
    {
        if (in_array('*', $this->abilities ?? [])) {
            return true;
        }

        return in_array($ability, $this->abilities ?? []);
    }

    public function touchLastUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}
