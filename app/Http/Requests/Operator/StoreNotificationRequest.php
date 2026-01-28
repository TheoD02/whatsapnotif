<?php

namespace App\Http\Requests\Operator;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRequest extends FormRequest
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
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:4096'],
            'template_id' => ['nullable', 'exists:message_templates,id'],
            'contact_ids' => ['nullable', 'array'],
            'contact_ids.*' => ['exists:contacts,id'],
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
            'content.required' => 'Le contenu du message est requis.',
            'content.max' => 'Le contenu ne peut pas dépasser 4096 caractères.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (empty($this->contact_ids) && empty($this->group_ids)) {
                $validator->errors()->add('recipients', 'Veuillez sélectionner au moins un destinataire.');
            }
        });
    }
}
