<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\InvitationCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(Request $request): Response
    {
        $invitationCode = $request->query('code');
        $validCode = null;

        if ($invitationCode) {
            $validCode = InvitationCode::where('code', $invitationCode)
                ->whereNull('used_by')
                ->where('expires_at', '>', now())
                ->first();
        }

        return Inertia::render('auth/Register', [
            'invitationCode' => $validCode ? $invitationCode : null,
            'hasValidCode' => $validCode !== null,
        ]);
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $invitedBy = null;
        $status = 'pending';

        if ($request->invitation_code) {
            $invitationCode = InvitationCode::where('code', $request->invitation_code)
                ->whereNull('used_by')
                ->where('expires_at', '>', now())
                ->first();

            if ($invitationCode) {
                $invitedBy = $invitationCode->created_by;
                $status = 'active';
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'operator',
            'status' => $status,
            'invited_by' => $invitedBy,
        ]);

        if ($invitedBy && isset($invitationCode)) {
            $invitationCode->markAsUsed($user);
        }

        Auth::login($user);

        if ($user->status === 'pending') {
            return redirect()->route('pending-approval');
        }

        return redirect('/dashboard');
    }
}
