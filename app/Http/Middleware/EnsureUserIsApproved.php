<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        if ($request->user()->status === UserStatus::Pending) {
            return redirect()->route('pending-approval');
        }

        if ($request->user()->status === UserStatus::Rejected) {
            auth()->logout();

            return redirect()->route('login')->with('error', 'Votre compte a été rejeté.');
        }

        return $next($request);
    }
}
