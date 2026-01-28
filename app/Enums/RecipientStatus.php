<?php

namespace App\Enums;

enum RecipientStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Delivered = 'delivered';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Sent => 'Envoyé',
            self::Delivered => 'Livré',
            self::Failed => 'Échoué',
        };
    }
}
