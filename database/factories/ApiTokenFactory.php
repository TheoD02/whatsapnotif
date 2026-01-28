<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApiToken>
 */
class ApiTokenFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plainToken = Str::random(40);

        return [
            'name' => fake()->words(2, true),
            'token_hash' => hash('sha256', $plainToken),
            'token_prefix' => substr($plainToken, 0, 8),
            'abilities' => ['*'],
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

    public function withAbilities(array $abilities): static
    {
        return $this->state(fn (array $attributes) => [
            'abilities' => $abilities,
        ]);
    }

    public function lastUsedAt(\DateTimeInterface $date): static
    {
        return $this->state(fn (array $attributes) => [
            'last_used_at' => $date,
        ]);
    }
}
