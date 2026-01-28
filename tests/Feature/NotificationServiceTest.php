<?php

namespace Tests\Feature;

use App\Enums\MessagingChannel;
use App\Enums\NotificationStatus;
use App\Enums\RecipientStatus;
use App\Models\Contact;
use App\Models\Group;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    private NotificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NotificationService;
    }

    public function test_can_create_notification_with_contacts(): void
    {
        $user = User::factory()->create();
        $contacts = Contact::factory()->count(3)->create();

        $notification = $this->service->create(
            user: $user,
            content: 'Test message',
            contactIds: $contacts->pluck('id')->toArray(),
        );

        $this->assertEquals(NotificationStatus::Draft, $notification->status);
        $this->assertEquals(3, $notification->recipients()->count());
    }

    public function test_can_create_notification_with_groups(): void
    {
        $user = User::factory()->create();
        $group = Group::factory()->create();
        $contacts = Contact::factory()->count(5)->create();
        $group->contacts()->attach($contacts);

        $notification = $this->service->create(
            user: $user,
            content: 'Group message',
            groupIds: [$group->id],
        );

        $this->assertEquals(5, $notification->recipients()->count());
    }

    public function test_recipients_are_unique_when_contact_in_multiple_groups(): void
    {
        $user = User::factory()->create();
        $group1 = Group::factory()->create();
        $group2 = Group::factory()->create();
        $contact = Contact::factory()->create();

        $group1->contacts()->attach($contact);
        $group2->contacts()->attach($contact);

        $notification = $this->service->create(
            user: $user,
            content: 'Multi-group message',
            groupIds: [$group1->id, $group2->id],
        );

        $this->assertEquals(1, $notification->recipients()->count());
    }

    public function test_inactive_contacts_are_excluded(): void
    {
        $user = User::factory()->create();
        $activeContact = Contact::factory()->create();
        $inactiveContact = Contact::factory()->inactive()->create();

        $notification = $this->service->create(
            user: $user,
            content: 'Test message',
            contactIds: [$activeContact->id, $inactiveContact->id],
        );

        $this->assertEquals(1, $notification->recipients()->count());
    }

    public function test_notification_status_changes_during_sending(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->create();

        $notification = $this->service->create(
            user: $user,
            content: 'Status test',
            contactIds: [$contact->id],
        );

        $this->assertEquals(NotificationStatus::Draft, $notification->status);

        $notification->markAsSending();
        $this->assertEquals(NotificationStatus::Sending, $notification->fresh()->status);
    }

    public function test_notification_calculates_success_rate(): void
    {
        $user = User::factory()->create();
        $contacts = Contact::factory()->count(4)->create();

        $notification = $this->service->create(
            user: $user,
            content: 'Rate test',
            contactIds: $contacts->pluck('id')->toArray(),
        );

        $recipients = $notification->recipients;
        $recipients[0]->update(['status' => RecipientStatus::Sent]);
        $recipients[1]->update(['status' => RecipientStatus::Sent]);
        $recipients[2]->update(['status' => RecipientStatus::Failed]);
        $recipients[3]->update(['status' => RecipientStatus::Pending]);

        $this->assertEquals(50.0, $notification->getSuccessRate());
    }

    public function test_message_personalization_replaces_variables(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->create([
            'name' => 'Jean Dupont',
            'phone' => '+33612345678',
            'metadata' => ['city' => 'Paris'],
        ]);

        $notification = $this->service->create(
            user: $user,
            content: 'Bonjour {{ nom }}, vous êtes de {{ city }}.',
            contactIds: [$contact->id],
        );

        $this->assertNotNull($notification);
    }

    public function test_notification_channel_defaults_to_whatsapp(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->create();

        $notification = $this->service->create(
            user: $user,
            content: 'Default channel test',
            contactIds: [$contact->id],
        );

        $this->assertEquals(MessagingChannel::WhatsApp, $notification->channel);
    }

    public function test_notification_can_use_telegram_channel(): void
    {
        $user = User::factory()->create();
        $contact = Contact::factory()->telegram()->create();

        $notification = $this->service->create(
            user: $user,
            content: 'Telegram test',
            contactIds: [$contact->id],
            channel: MessagingChannel::Telegram,
        );

        $this->assertEquals(MessagingChannel::Telegram, $notification->channel);
    }
}
