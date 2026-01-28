<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvitationRequest extends FormRequest
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
            'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:30'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'expires_in_days.min' => 'La durée de validité doit être d\'au moins 1 jour.',
            'expires_in_days.max' => 'La durée de validité ne peut pas dépasser 30 jours.',
        ];
    }
}
