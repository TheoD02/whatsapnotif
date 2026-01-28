<?php

namespace Database\Factories;

use App\Enums\MessagingChannel;
use App\Enums\NotificationStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'content' => fake()->paragraph(),
            'channel' => MessagingChannel::Telegram,
            'status' => NotificationStatus::Draft,
            'sent_by' => User::factory(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::Draft,
        ]);
    }

    public function sending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::Sending,
        ]);
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::Sent,
            'sent_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::Failed,
        ]);
    }

    public function partial(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::Partial,
            'sent_at' => now(),
        ]);
    }

    public function telegram(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => MessagingChannel::Telegram,
        ]);
    }
}
