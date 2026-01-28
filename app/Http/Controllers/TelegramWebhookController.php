<?php

namespace App\Http\Controllers;

use App\Models\TelegramLinkToken;
use App\Services\Messaging\TelegramChannel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $update = $request->all();

        Log::info('Telegram webhook received', $update);

        // Handle message
        if (isset($update['message'])) {
            $this->handleMessage($update['message']);
        }

        return response()->json(['ok' => true]);
    }

    private function handleMessage(array $message): void
    {
        $chatId = (string) $message['chat']['id'];
        $text = $message['text'] ?? '';
        $firstName = $message['from']['first_name'] ?? 'Utilisateur';

        // Handle /start command with token
        if (str_starts_with($text, '/start')) {
            $parts = explode(' ', $text);
            $token = $parts[1] ?? null;

            if ($token) {
                $this->handleLinkToken($chatId, $token, $firstName);
            } else {
                $this->handleStartCommand($chatId, $firstName);
            }

            return;
        }

        // Handle code input (6 characters)
        if (preg_match('/^[A-Z0-9]{6}$/i', trim($text))) {
            $this->handleCodeInput($chatId, strtoupper(trim($text)), $firstName);

            return;
        }

        // Default response
        $this->sendMessage($chatId, "Bonjour {$firstName} !\n\nPour lier votre compte, utilisez le lien ou le code fourni par l'administrateur.\n\nVotre Chat ID : `{$chatId}`");
    }

    private function handleStartCommand(string $chatId, string $firstName): void
    {
        $this->sendMessage(
            $chatId,
            "Bienvenue {$firstName} !\n\n".
            "Ce bot vous permet de recevoir des notifications.\n\n".
            "Pour lier votre compte :\n".
            "1. Demandez un lien ou code à l'administrateur\n".
            "2. Cliquez sur le lien ou envoyez le code ici\n\n".
            "Votre Chat ID : `{$chatId}`"
        );
    }

    private function handleLinkToken(string $chatId, string $token, string $firstName): void
    {
        $linkToken = TelegramLinkToken::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (! $linkToken) {
            $this->sendMessage($chatId, "Ce lien n'est plus valide ou a expiré.\n\nDemandez un nouveau lien à l'administrateur.");

            return;
        }

        if (! $linkToken->isValid()) {
            $this->sendMessage($chatId, "Ce lien a expiré.\n\nDemandez un nouveau lien à l'administrateur.");

            return;
        }

        $linkToken->markAsLinked($chatId);

        $contactName = $linkToken->contact->name;
        $this->sendMessage(
            $chatId,
            "Compte lié avec succès !\n\n".
            "Bonjour {$firstName}, vous êtes maintenant enregistré en tant que **{$contactName}**.\n\n".
            'Vous recevrez désormais les notifications sur Telegram.'
        );
    }

    private function handleCodeInput(string $chatId, string $code, string $firstName): void
    {
        $linkToken = TelegramLinkToken::where('code', $code)
            ->where('status', 'pending')
            ->first();

        if (! $linkToken) {
            $this->sendMessage($chatId, "Code invalide ou expiré.\n\nVérifiez le code et réessayez.");

            return;
        }

        if (! $linkToken->isValid()) {
            $this->sendMessage($chatId, "Ce code a expiré.\n\nDemandez un nouveau code à l'administrateur.");

            return;
        }

        $linkToken->markAsLinked($chatId);

        $contactName = $linkToken->contact->name;
        $this->sendMessage(
            $chatId,
            "Compte lié avec succès !\n\n".
            "Bonjour {$firstName}, vous êtes maintenant enregistré en tant que **{$contactName}**.\n\n".
            'Vous recevrez désormais les notifications sur Telegram.'
        );
    }

    private function sendMessage(string $chatId, string $message): void
    {
        $telegram = new TelegramChannel;
        $telegram->send($chatId, $message, ['parse_mode' => 'Markdown']);
    }
}
