<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingChannel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramChannel implements MessagingChannel
{
    private string $botToken;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
    }

    public function getName(): string
    {
        return 'telegram';
    }

    public function send(string $chatId, string $message, array $options = []): SendResult
    {
        if (empty($this->botToken)) {
            return SendResult::failure('Telegram Bot non configuré');
        }

        if (!$this->validateChatId($chatId)) {
            return SendResult::failure('Chat ID Telegram invalide');
        }

        $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";

        $payload = [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => $options['parse_mode'] ?? null,
        ];

        $payload = array_filter($payload);

        try {
            $response = Http::timeout(30)->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['ok'] ?? false) {
                    $messageId = (string) ($data['result']['message_id'] ?? null);

                    return SendResult::success($messageId, [
                        'telegram_message_id' => $messageId,
                        'chat_id' => $chatId,
                    ]);
                }

                $error = $data['description'] ?? 'Erreur Telegram inconnue';
                Log::error('Telegram send error', [
                    'chat_id' => $chatId,
                    'error' => $error,
                    'response' => $data,
                ]);

                return SendResult::failure($error);
            }

            $error = $response->json('description', 'Erreur Telegram inconnue');
            Log::error('Telegram send error', [
                'chat_id' => $chatId,
                'error' => $error,
                'response' => $response->json(),
            ]);

            return SendResult::failure($error);
        } catch (\Exception $e) {
            Log::error('Telegram send exception', [
                'chat_id' => $chatId,
                'exception' => $e->getMessage(),
            ]);

            return SendResult::failure($e->getMessage());
        }
    }

    public function validateChatId(string $chatId): bool
    {
        return preg_match('/^-?\d+$/', $chatId) === 1;
    }

    public function validatePhone(string $phone): bool
    {
        return $this->validateChatId($phone);
    }

    public function formatPhone(string $phone): string
    {
        return trim($phone);
    }
}
