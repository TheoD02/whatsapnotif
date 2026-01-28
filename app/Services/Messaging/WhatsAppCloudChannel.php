<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingChannel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppCloudChannel implements MessagingChannel
{
    private string $phoneNumberId;

    private string $accessToken;

    private string $apiVersion;

    public function __construct()
    {
        $this->phoneNumberId = config('services.whatsapp.phone_number_id', '');
        $this->accessToken = config('services.whatsapp.access_token', '');
        $this->apiVersion = config('services.whatsapp.api_version', 'v17.0');
    }

    public function getName(): string
    {
        return 'whatsapp';
    }

    public function send(string $phone, string $message, array $options = []): SendResult
    {
        if (empty($this->phoneNumberId) || empty($this->accessToken)) {
            return SendResult::failure('WhatsApp Cloud API non configurée');
        }

        $phone = $this->formatPhone($phone);

        if (! $this->validatePhone($phone)) {
            return SendResult::failure('Numéro de téléphone invalide');
        }

        $url = "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/messages";

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => preg_replace('/[^0-9]/', '', $phone),
            'type' => 'text',
            'text' => [
                'preview_url' => false,
                'body' => $message,
            ],
        ];

        try {
            $response = Http::withToken($this->accessToken)
                ->timeout(30)
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $messageId = $data['messages'][0]['id'] ?? null;

                return SendResult::success($messageId, [
                    'whatsapp_message_id' => $messageId,
                ]);
            }

            $error = $response->json('error.message', 'Erreur WhatsApp inconnue');
            Log::error('WhatsApp send error', [
                'phone' => $phone,
                'error' => $error,
                'response' => $response->json(),
            ]);

            return SendResult::failure($error);
        } catch (\Exception $e) {
            Log::error('WhatsApp send exception', [
                'phone' => $phone,
                'exception' => $e->getMessage(),
            ]);

            return SendResult::failure($e->getMessage());
        }
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
