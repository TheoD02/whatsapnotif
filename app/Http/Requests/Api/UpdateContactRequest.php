<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactRequest extends FormRequest
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
        $contactId = $this->route('contact')?->id ?? $this->route('contact');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20', 'unique:contacts,phone,' . $contactId],
            'preferred_channel' => ['sometimes', 'string', 'in:whatsapp,telegram'],
            'telegram_chat_id' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function bodyParameters(): array
    {
        return [
            'name' => 'Nom complet du contact',
            'phone' => 'Numéro de téléphone au format international (+33612345678)',
            'preferred_channel' => 'Canal de communication préféré (whatsapp ou telegram)',
            'telegram_chat_id' => 'ID du chat Telegram',
            'metadata' => 'Données personnalisées (fusionne avec les données existantes)',
            'is_active' => 'Statut du contact (true = actif, false = inactif)',
            'group_ids' => 'Liste des IDs de groupes (remplace les groupes existants)',
        ];
    }
}
