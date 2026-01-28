<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MessageTemplate>
 */
class MessageTemplateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'content' => 'Bonjour {{ nom }}, '.fake()->paragraph(),
            'created_by' => User::factory(),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function withVariables(array $variables): static
    {
        $content = collect($variables)
            ->map(fn ($var) => "{{ $var }}")
            ->join(' ');

        return $this->state(fn (array $attributes) => [
            'content' => $content,
        ]);
    }
}
