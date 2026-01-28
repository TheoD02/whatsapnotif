<?php

namespace App\Http\Requests\Admin;

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
            'preferred_channel' => ['required', 'in:whatsapp,telegram'],
            'phone' => ['required_if:preferred_channel,whatsapp', 'nullable', 'string', 'max:20', 'unique:contacts'],
            'telegram_chat_id' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['exists:groups,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est requis.',
            'phone.required_if' => 'Le numéro de téléphone est requis pour WhatsApp.',
            'phone.unique' => 'Ce numéro de téléphone existe déjà.',
        ];
    }
}
