<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGroupRequest;
use App\Http\Requests\Admin\UpdateGroupRequest;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(): Response
    {
        $groups = Group::withCount(['contacts', 'authorizedUsers'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/groups/Index', [
            'groups' => $groups,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/groups/Create');
    }

    public function store(StoreGroupRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure unique slug
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Group::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug.'-'.$counter++;
        }

        Group::create($validated);

        return redirect()->route('admin.groups.index')
            ->with('success', "Le groupe {$validated['name']} a été créé.");
    }

    public function edit(Group $group): Response
    {
        $group->load('contacts');

        return Inertia::render('admin/groups/Edit', [
            'group' => $group,
        ]);
    }

    public function update(UpdateGroupRequest $request, Group $group): RedirectResponse
    {
        $group->update($request->validated());

        return redirect()->route('admin.groups.index')
            ->with('success', "Le groupe {$group->name} a été mis à jour.");
    }

    public function destroy(Group $group): RedirectResponse
    {
        $group->delete();

        return redirect()->route('admin.groups.index')
            ->with('success', 'Le groupe a été supprimé.');
    }
}
