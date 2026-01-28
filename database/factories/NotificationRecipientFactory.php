<?php

namespace Database\Factories;

use App\Enums\RecipientStatus;
use App\Models\Contact;
use App\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationRecipient>
 */
class NotificationRecipientFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'notification_id' => Notification::factory(),
            'contact_id' => Contact::factory(),
            'status' => RecipientStatus::Pending,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RecipientStatus::Pending,
        ]);
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RecipientStatus::Sent,
            'sent_at' => now(),
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RecipientStatus::Delivered,
            'sent_at' => now(),
        ]);
    }

    public function failed(string $error = 'Erreur de test'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RecipientStatus::Failed,
            'error_message' => $error,
        ]);
    }
}
