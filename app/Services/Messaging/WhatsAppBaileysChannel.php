<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingChannel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppBaileysChannel implements MessagingChannel
{
    private string $serviceUrl;

    public function __construct()
    {
        $this->serviceUrl = config('services.whatsapp_baileys.url', 'http://localhost:3001');
    }

    public function getName(): string
    {
        return 'whatsapp_baileys';
    }

    public function send(string $phone, string $message, array $options = []): SendResult
    {
        try {
            $response = Http::timeout(30)->post("{$this->serviceUrl}/send", [
                'phone' => $this->formatPhone($phone),
                'message' => $message,
            ]);

            $data = $response->json();

            if ($data['success'] ?? false) {
                return new SendResult(
                    success: true,
                    messageId: $data['messageId'] ?? null,
                );
            }

            return new SendResult(
                success: false,
                error: $data['error'] ?? 'Unknown error',
            );
        } catch (\Exception $e) {
            Log::error('WhatsApp Baileys send error', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);

            return new SendResult(
                success: false,
                error: $e->getMessage(),
            );
        }
    }

    public function validatePhone(string $phone): bool
    {
        $cleaned = preg_replace('/[^0-9+]/', '', $phone);
        return preg_match('/^\+?[1-9]\d{6,14}$/', $cleaned) === 1;
    }

    public function formatPhone(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9+]/', '', $phone);

        if (!str_starts_with($cleaned, '+')) {
            $cleaned = '+' . $cleaned;
        }

        return $cleaned;
    }

    public function getStatus(): array
    {
        try {
            $response = Http::timeout(5)->get("{$this->serviceUrl}/status");
            return $response->json();
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => 'Service not reachable: ' . $e->getMessage(),
            ];
        }
    }

    public function getQrCode(): ?string
    {
        try {
            $response = Http::timeout(5)->get("{$this->serviceUrl}/qr");

            if ($response->successful()) {
                return $response->json()['qr'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function logout(): bool
    {
        try {
            $response = Http::timeout(10)->post("{$this->serviceUrl}/logout");
            return $response->json()['success'] ?? false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function reconnect(): bool
    {
        try {
            $response = Http::timeout(10)->post("{$this->serviceUrl}/reconnect");
            return $response->json()['success'] ?? false;
        } catch (\Exception $e) {
            return false;
        }
    }
}
