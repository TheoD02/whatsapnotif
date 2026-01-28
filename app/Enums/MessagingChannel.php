<?php

namespace App\Enums;

enum MessagingChannel: string
{
    case Telegram = 'telegram';

    public function label(): string
    {
        return match ($this) {
            self::Telegram => 'Telegram',
        };
    }
}
