<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Contacts
 */
class ContactController extends Controller
{
    /**
     * Lister les contacts
     *
     * Retourne la liste paginée des contacts avec leurs groupes.
     *
     * @operationId listContacts
     * @queryParam group_id integer Filtrer par ID de groupe.
     * @queryParam active boolean Filtrer par statut actif/inactif.
     * @queryParam per_page integer Nombre de résultats par page (défaut: 50).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contact::with('groups');

        if ($request->has('group_id')) {
            $query->whereHas('groups', function ($q) use ($request) {
                $q->where('groups.id', $request->group_id);
            });
        }

        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        $contacts = $query->latest()->paginate($request->per_page ?? 50);

        return response()->json($contacts);
    }

    /**
     * Créer un contact
     *
     * Crée un nouveau contact avec ses groupes associés.
     *
     * @operationId createContact
     * @response 201 {
     *   "success": true,
     *   "contact": {
     *     "id": 1,
     *     "name": "Jean Dupont",
     *     "phone": "+33612345678",
     *     "preferred_channel": "whatsapp",
     *     "groups": []
     *   }
     * }
     */
    public function store(Request $request): JsonResponse
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

        return response()->json([
            'success' => true,
            'contact' => $contact->load('groups'),
        ], 201);
    }

    /**
     * Afficher un contact
     *
     * Retourne les détails d'un contact spécifique.
     *
     * @operationId getContact
     */
    public function show(Contact $contact): JsonResponse
    {
        return response()->json([
            'contact' => $contact->load('groups'),
        ]);
    }

    /**
     * Modifier un contact
     *
     * Met à jour les informations d'un contact existant.
     *
     * @operationId updateContact
     */
    public function update(Request $request, Contact $contact): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20', 'unique:contacts,phone,' . $contact->id],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['exists:groups,id'],
        ]);

        if (isset($validated['phone'])) {
            $validated['phone'] = Contact::formatPhone($validated['phone']);
        }

        $contact->update($validated);

        if (array_key_exists('group_ids', $validated)) {
            $contact->groups()->sync($validated['group_ids'] ?? []);
        }

        return response()->json([
            'success' => true,
            'contact' => $contact->load('groups'),
        ]);
    }

    /**
     * Lister les groupes
     *
     * Retourne la liste de tous les groupes avec le nombre de contacts.
     *
     * @operationId listGroups
     * @tags Groupes
     */
    public function groups(): JsonResponse
    {
        $groups = Group::withCount('contacts')->orderBy('name')->get();

        return response()->json([
            'groups' => $groups,
        ]);
    }

    /**
     * Lister les templates
     *
     * Retourne la liste des templates de messages actifs.
     *
     * @operationId listTemplates
     * @tags Templates
     */
    public function templates(): JsonResponse
    {
        $templates = \App\Models\MessageTemplate::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'content']);

        return response()->json([
            'templates' => $templates,
        ]);
    }
}
