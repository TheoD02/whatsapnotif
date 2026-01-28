<?php

namespace App\Contracts;

use App\Services\Messaging\SendResult;

interface MessagingChannel
{
    public function getName(): string;

    public function send(string $phone, string $message, array $options = []): SendResult;

    public function validatePhone(string $phone): bool;

    public function formatPhone(string $phone): string;
}
