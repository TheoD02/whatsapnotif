<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    public function index(): Response
    {
        $tokens = ApiToken::with('creator')
            ->latest()
            ->get();

        return Inertia::render('admin/api-tokens/Index', [
            'tokens' => $tokens,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'abilities' => ['array'],
            'abilities.*' => ['string'],
        ]);

        $result = ApiToken::generate(
            auth()->user(),
            $validated['name'],
            $validated['abilities'] ?? ['*']
        );

        return back()->with('success', "Token créé : {$result['plain_token']}");
    }

    public function destroy(ApiToken $apiToken): RedirectResponse
    {
        $apiToken->delete();

        return back()->with('success', 'Le token a été supprimé.');
    }
}
