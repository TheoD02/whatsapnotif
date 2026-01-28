<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportContactsRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            'group_id' => ['nullable', 'exists:groups,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Le fichier CSV est requis.',
            'file.mimes' => 'Le fichier doit être au format CSV.',
            'file.max' => 'Le fichier ne doit pas dépasser 5 Mo.',
        ];
    }
}
