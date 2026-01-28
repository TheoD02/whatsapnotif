<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        $apiToken = ApiToken::findByToken($token);

        if (!$apiToken) {
            return response()->json(['error' => 'Token invalide'], 401);
        }

        $apiToken->touchLastUsed();
        $request->merge(['api_token' => $apiToken]);

        return $next($request);
    }
}
