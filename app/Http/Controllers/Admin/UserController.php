<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserGroupsRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->with('allowedGroups')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $groups = Group::orderBy('name')->get();

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'groups' => $groups,
            'filters' => $request->only(['status', 'role', 'search']),
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['allowedGroups', 'inviter', 'invitedUsers']);

        $groups = Group::orderBy('name')->get();

        return Inertia::render('admin/users/Show', [
            'user' => $user,
            'groups' => $groups,
        ]);
    }

    public function approve(User $user): RedirectResponse
    {
        $user->update(['status' => UserStatus::Active]);

        return back()->with('success', "L'utilisateur {$user->name} a été approuvé.");
    }

    public function reject(User $user): RedirectResponse
    {
        $user->update(['status' => UserStatus::Rejected]);

        return back()->with('success', "L'utilisateur {$user->name} a été rejeté.");
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $user->update(['role' => $request->validated()['role']]);

        return back()->with('success', "Le rôle de {$user->name} a été mis à jour.");
    }

    public function updateGroups(UpdateUserGroupsRequest $request, User $user): RedirectResponse
    {
        $user->allowedGroups()->sync($request->validated()['group_ids'] ?? []);

        return back()->with('success', "Les permissions de groupe de {$user->name} ont été mises à jour.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', "L'utilisateur {$user->name} a été supprimé.");
    }
}
