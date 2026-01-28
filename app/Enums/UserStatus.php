<?php

namespace App\Enums;

enum UserStatus: string
{
    case Active = 'active';
    case Pending = 'pending';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Actif',
            self::Pending => 'En attente',
            self::Rejected => 'Rejeté',
        };
    }
}
