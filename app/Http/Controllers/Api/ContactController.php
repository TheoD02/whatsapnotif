<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreContactRequest;
use App\Http\Requests\Api\UpdateContactRequest;
use App\Http\Resources\ContactResource;
use App\Http\Resources\GroupResource;
use App\Http\Resources\TemplateResource;
use App\Models\Contact;
use App\Models\Group;
use App\Models\MessageTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
     * @queryParam group_id integer Filtrer par ID de groupe. Example: 1
     * @queryParam active boolean Filtrer par statut actif/inactif. Example: true
     * @queryParam per_page integer Nombre de résultats par page (défaut: 50). Example: 20
     * @queryParam page integer Numéro de page. Example: 1
     */
    public function index(Request $request): AnonymousResourceCollection
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

        return ContactResource::collection($contacts);
    }

    /**
     * Créer un contact
     *
     * Crée un nouveau contact avec ses groupes associés.
     *
     * @operationId createContact
     */
    public function store(StoreContactRequest $request): ContactResource
    {
        $validated = $request->validated();

        if (isset($validated['phone'])) {
            $validated['phone'] = Contact::formatPhone($validated['phone']);
        }

        $contact = Contact::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'preferred_channel' => $validated['preferred_channel'] ?? 'whatsapp',
            'telegram_chat_id' => $validated['telegram_chat_id'] ?? null,
            'metadata' => $validated['metadata'] ?? [],
        ]);

        if (!empty($validated['group_ids'])) {
            $contact->groups()->sync($validated['group_ids']);
        }

        return new ContactResource($contact->load('groups'));
    }

    /**
     * Afficher un contact
     *
     * Retourne les détails d'un contact spécifique.
     *
     * @operationId getContact
     */
    public function show(Contact $contact): ContactResource
    {
        return new ContactResource($contact->load('groups'));
    }

    /**
     * Modifier un contact
     *
     * Met à jour les informations d'un contact existant.
     *
     * @operationId updateContact
     */
    public function update(UpdateContactRequest $request, Contact $contact): ContactResource
    {
        $validated = $request->validated();

        if (isset($validated['phone'])) {
            $validated['phone'] = Contact::formatPhone($validated['phone']);
        }

        $contact->update($validated);

        if (array_key_exists('group_ids', $validated)) {
            $contact->groups()->sync($validated['group_ids'] ?? []);
        }

        return new ContactResource($contact->load('groups'));
    }

    /**
     * Lister les groupes
     *
     * Retourne la liste de tous les groupes avec le nombre de contacts.
     *
     * @operationId listGroups
     * @tags Groupes
     */
    public function groups(): AnonymousResourceCollection
    {
        $groups = Group::withCount('contacts')->orderBy('name')->get();

        return GroupResource::collection($groups);
    }

    /**
     * Lister les templates
     *
     * Retourne la liste des templates de messages actifs.
     *
     * @operationId listTemplates
     * @tags Templates
     */
    public function templates(): AnonymousResourceCollection
    {
        $templates = MessageTemplate::where('is_active', true)
            ->orderBy('name')
            ->get();

        return TemplateResource::collection($templates);
    }
}
