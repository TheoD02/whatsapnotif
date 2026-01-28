<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        $props = [];

        if (app()->environment('local')) {
            $props['devUsers'] = User::query()
                ->where('status', UserStatus::Active)
                ->select(['id', 'name', 'email', 'role'])
                ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
                ->orderBy('name')
                ->limit(10)
                ->get();
        }

        return Inertia::render('auth/Login', $props);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Ces identifiants ne correspondent pas.',
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->status === UserStatus::Pending) {
            return redirect()->route('pending-approval');
        }

        if ($user->status === UserStatus::Rejected) {
            Auth::logout();

            return redirect()->route('login')->with('error', 'Votre compte a été rejeté.');
        }

        if ($user->isAdmin()) {
            return redirect()->intended('/admin');
        }

        return redirect()->intended('/dashboard');
    }

    public function fastLogin(Request $request, User $user): RedirectResponse
    {
        if (! app()->environment('local')) {
            abort(404);
        }

        Auth::login($user);
        $request->session()->regenerate();

        if ($user->isAdmin()) {
            return redirect()->intended('/admin');
        }

        return redirect()->intended('/dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
