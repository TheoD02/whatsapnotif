<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvitationCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function index(): Response
    {
        $invitations = InvitationCode::with(['creator', 'usedBy'])
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/invitations/Index', [
            'invitations' => $invitations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:30'],
        ]);

        $expiresInDays = $request->expires_in_days ?? 7;

        $invitation = InvitationCode::generate(auth()->user(), $expiresInDays);

        return back()->with('success', "Code d'invitation créé : {$invitation->code}");
    }

    public function destroy(InvitationCode $invitation): RedirectResponse
    {
        if ($invitation->isUsed()) {
            return back()->with('error', 'Ce code a déjà été utilisé et ne peut pas être supprimé.');
        }

        $invitation->delete();

        return back()->with('success', "Le code d'invitation a été supprimé.");
    }
}
