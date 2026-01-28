<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SendNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:4096'],
            'template_id' => ['nullable', 'integer', 'exists:message_templates,id'],
            'template_data' => ['nullable', 'array'],
            'recipients' => ['required', 'array'],
            'recipients.contact_ids' => ['nullable', 'array'],
            'recipients.contact_ids.*' => ['integer', 'exists:contacts,id'],
            'recipients.group_ids' => ['nullable', 'array'],
            'recipients.group_ids.*' => ['integer', 'exists:groups,id'],
            'recipients.phones' => ['nullable', 'array'],
            'recipients.phones.*' => ['string', 'max:20'],
            'channel' => ['nullable', 'string', 'in:telegram'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function bodyParameters(): array
    {
        return [
            'content' => 'Le contenu du message. Supporte les variables {{nom}}, {{phone}}, etc.',
            'template_id' => 'ID du template de message à utiliser (optionnel)',
            'template_data' => 'Données pour les variables du template',
            'recipients' => 'Objet contenant les destinataires',
            'recipients.contact_ids' => 'Liste des IDs de contacts existants',
            'recipients.group_ids' => 'Liste des IDs de groupes (tous les contacts du groupe recevront le message)',
            'recipients.phones' => 'Liste de numéros de téléphone (crée automatiquement les contacts)',
            'channel' => 'Canal de communication forcé (telegram). Si non spécifié, utilise le canal préféré du contact.',
        ];
    }
}
