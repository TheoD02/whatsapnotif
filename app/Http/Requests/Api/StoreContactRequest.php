<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:contacts,phone'],
            'preferred_channel' => ['nullable', 'string', 'in:telegram'],
            'telegram_chat_id' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
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
            'preferred_channel' => 'Canal de communication préféré (telegram)',
            'telegram_chat_id' => 'ID du chat Telegram',
            'metadata' => 'Données personnalisées (ex: {"company": "ACME", "city": "Paris"})',
            'group_ids' => 'Liste des IDs de groupes auxquels ajouter le contact',
        ];
    }
}
