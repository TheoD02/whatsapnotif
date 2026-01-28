<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingChannel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MockChannel implements MessagingChannel
{
    public function getName(): string
    {
        return 'mock';
    }

    public function send(string $phone, string $message, array $options = []): SendResult
    {
        $phone = $this->formatPhone($phone);

        if (! $this->validatePhone($phone)) {
            return SendResult::failure('Numéro de téléphone invalide');
        }

        // Simulate a small delay
        usleep(100000); // 100ms

        // Log the mock send
        Log::info('Mock message sent', [
            'phone' => $phone,
            'message' => $message,
            'options' => $options,
        ]);

        // Simulate 95% success rate
        if (rand(1, 100) <= 95) {
            $messageId = 'mock_'.Str::random(24);

            return SendResult::success($messageId, [
                'simulated' => true,
            ]);
        }

        return SendResult::failure('Erreur simulée pour les tests');
    }

    public function validatePhone(string $phone): bool
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        return strlen($cleaned) >= 10 && strlen($cleaned) <= 15;
    }

    public function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '+33'.substr($phone, 1);
        }

        if (! str_starts_with($phone, '+')) {
            $phone = '+'.$phone;
        }

        return $phone;
    }
}
