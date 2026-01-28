<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Contact::with('groups');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('group') && $request->group !== 'all') {
            $query->whereHas('groups', function ($q) use ($request) {
                $q->where('groups.id', $request->group);
            });
        }

        if ($request->has('active') && $request->active !== 'all') {
            $query->where('is_active', $request->active === 'true');
        }

        $contacts = $query->latest()->paginate(20)->withQueryString();
        $groups = Group::withCount('contacts')->orderBy('name')->get();

        return Inertia::render('admin/contacts/Index', [
            'contacts' => $contacts,
            'groups' => $groups,
            'filters' => $request->only(['search', 'group', 'active']),
        ]);
    }

    public function create(): Response
    {
        $groups = Group::orderBy('name')->get();

        return Inertia::render('admin/contacts/Create', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'unique:contacts'],
            'metadata' => ['nullable', 'array'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['exists:groups,id'],
        ]);

        $validated['phone'] = Contact::formatPhone($validated['phone']);

        $contact = Contact::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'metadata' => $validated['metadata'] ?? [],
        ]);

        if (!empty($validated['group_ids'])) {
            $contact->groups()->sync($validated['group_ids']);
        }

        return redirect()->route('admin.contacts.index')
            ->with('success', "Le contact {$contact->name} a été créé.");
    }

    public function edit(Contact $contact): Response
    {
        $contact->load('groups');
        $groups = Group::orderBy('name')->get();

        return Inertia::render('admin/contacts/Edit', [
            'contact' => $contact,
            'groups' => $groups,
        ]);
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'unique:contacts,phone,' . $contact->id],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['exists:groups,id'],
        ]);

        $validated['phone'] = Contact::formatPhone($validated['phone']);

        $contact->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'metadata' => $validated['metadata'] ?? [],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $contact->groups()->sync($validated['group_ids'] ?? []);

        return redirect()->route('admin.contacts.index')
            ->with('success', "Le contact {$contact->name} a été mis à jour.");
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $contact->delete();

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Le contact a été supprimé.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
            'group_id' => ['nullable', 'exists:groups,id'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');

        $header = fgetcsv($handle);
        $nameIndex = array_search('name', array_map('strtolower', $header));
        $phoneIndex = array_search('phone', array_map('strtolower', $header));

        if ($nameIndex === false || $phoneIndex === false) {
            return back()->with('error', 'Le fichier CSV doit contenir les colonnes "name" et "phone".');
        }

        $imported = 0;
        $errors = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $name = $row[$nameIndex] ?? null;
            $phone = $row[$phoneIndex] ?? null;

            if (empty($name) || empty($phone)) {
                $errors++;
                continue;
            }

            $phone = Contact::formatPhone($phone);

            $contact = Contact::updateOrCreate(
                ['phone' => $phone],
                ['name' => $name]
            );

            if ($request->group_id) {
                $contact->groups()->syncWithoutDetaching([$request->group_id]);
            }

            $imported++;
        }

        fclose($handle);

        $message = "{$imported} contact(s) importé(s).";
        if ($errors > 0) {
            $message .= " {$errors} ligne(s) ignorée(s).";
        }

        return back()->with('success', $message);
    }
}
