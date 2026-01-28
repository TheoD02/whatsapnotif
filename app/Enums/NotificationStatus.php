<?php

namespace App\Enums;

enum NotificationStatus: string
{
    case Draft = 'draft';
    case Sending = 'sending';
    case Sent = 'sent';
    case Partial = 'partial';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Sending => 'En cours',
            self::Sent => 'Envoyé',
            self::Partial => 'Partiel',
            self::Failed => 'Échoué',
        };
    }
}
