<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'content',
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'template_id');
    }

    public function getVariables(): array
    {
        preg_match_all('/\{\{\s*(\w+)\s*\}\}/', $this->content, $matches);
        return array_unique($matches[1]);
    }

    public function render(array $data): string
    {
        $content = $this->content;

        foreach ($data as $key => $value) {
            $content = preg_replace('/\{\{\s*' . preg_quote($key, '/') . '\s*\}\}/', $value, $content);
        }

        return $content;
    }
}
