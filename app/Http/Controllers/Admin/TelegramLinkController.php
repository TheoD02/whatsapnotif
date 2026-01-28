<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\TelegramLinkToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelegramLinkController extends Controller
{
    public function generate(Contact $contact): JsonResponse
    {
        $token = TelegramLinkToken::generateForContact($contact);

        return response()->json([
            'success' => true,
            'token' => $token->token,
            'code' => $token->code,
            'deep_link' => $token->getDeepLink(),
            'expires_at' => $token->expires_at->toISOString(),
            'expires_in_minutes' => 30,
        ]);
    }

    public function status(Contact $contact): JsonResponse
    {
        $token = TelegramLinkToken::where('contact_id', $contact->id)
            ->latest()
            ->first();

        if (!$token) {
            return response()->json([
                'has_token' => false,
            ]);
        }

        return response()->json([
            'has_token' => true,
            'status' => $token->status,
            'is_linked' => $token->status === 'linked',
            'telegram_chat_id' => $token->telegram_chat_id,
            'linked_at' => $token->linked_at?->toISOString(),
        ]);
    }

    public function checkPending(Contact $contact): JsonResponse
    {
        // Get the most recent token for this contact
        $token = TelegramLinkToken::where('contact_id', $contact->id)
            ->latest()
            ->first();

        // Check if contact was linked (either via token or directly)
        $contact->refresh();

        if ($contact->telegram_chat_id) {
            return response()->json([
                'pending' => false,
                'linked' => true,
                'telegram_chat_id' => $contact->telegram_chat_id,
            ]);
        }

        if (!$token || $token->expires_at->isPast()) {
            return response()->json([
                'pending' => false,
                'linked' => false,
            ]);
        }

        return response()->json([
            'pending' => $token->status === 'pending',
            'linked' => $token->status === 'linked',
            'telegram_chat_id' => $token->telegram_chat_id,
        ]);
    }
}
