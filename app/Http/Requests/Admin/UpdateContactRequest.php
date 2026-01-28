<?php

namespace App\Http\Requests\Admin;

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
        $contactId = $this->route('contact')->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'preferred_channel' => ['required', 'in:telegram'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:contacts,phone,'.$contactId],
            'telegram_chat_id' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['exists:groups,id'],
        ];
    }
}
