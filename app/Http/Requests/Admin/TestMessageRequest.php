<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TestMessageRequest extends FormRequest
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
            'identifier' => ['required', 'string'],
            'message' => ['required', 'string', 'max:4096'],
            'channel' => ['required', 'in:whatsapp,telegram'],
        ];
    }
}
