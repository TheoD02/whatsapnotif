<?php

namespace Database\Factories;

use App\Enums\MessagingChannel;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contact>
 */
class ContactFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => Contact::formatPhone(fake()->phoneNumber()),
            'preferred_channel' => MessagingChannel::Telegram,
            'telegram_chat_id' => (string) fake()->randomNumber(9),
            'is_active' => true,
            'metadata' => [],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function telegram(): static
    {
        return $this->state(fn (array $attributes) => [
            'preferred_channel' => MessagingChannel::Telegram,
            'telegram_chat_id' => (string) fake()->randomNumber(9),
        ]);
    }

    public function withMetadata(array $metadata): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => $metadata,
        ]);
    }
}
