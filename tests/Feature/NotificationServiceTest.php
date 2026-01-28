<?php

use App\Enums\MessagingChannel;
use App\Enums\NotificationStatus;
use App\Enums\RecipientStatus;
use App\Models\Contact;
use App\Models\Group;
use App\Models\User;
use App\Services\NotificationService;

beforeEach(function () {
    $this->service = new NotificationService;
});

test('can create notification with contacts', function () {
    $user = User::factory()->create();
    $contacts = Contact::factory()->count(3)->create();

    $notification = $this->service->create(
        user: $user,
        content: 'Test message',
        contactIds: $contacts->pluck('id')->toArray(),
    );

    expect($notification->status)->toBe(NotificationStatus::Draft);
    expect($notification->recipients()->count())->toBe(3);
});

test('can create notification with groups', function () {
    $user = User::factory()->create();
    $group = Group::factory()->create();
    $contacts = Contact::factory()->count(5)->create();
    $group->contacts()->attach($contacts);

    $notification = $this->service->create(
        user: $user,
        content: 'Group message',
        groupIds: [$group->id],
    );

    expect($notification->recipients()->count())->toBe(5);
});

test('recipients are unique when contact in multiple groups', function () {
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

    expect($notification->recipients()->count())->toBe(1);
});

test('inactive contacts are excluded', function () {
    $user = User::factory()->create();
    $activeContact = Contact::factory()->create();
    $inactiveContact = Contact::factory()->inactive()->create();

    $notification = $this->service->create(
        user: $user,
        content: 'Test message',
        contactIds: [$activeContact->id, $inactiveContact->id],
    );

    expect($notification->recipients()->count())->toBe(1);
});

test('notification status changes during sending', function () {
    $user = User::factory()->create();
    $contact = Contact::factory()->create();

    $notification = $this->service->create(
        user: $user,
        content: 'Status test',
        contactIds: [$contact->id],
    );

    expect($notification->status)->toBe(NotificationStatus::Draft);

    $notification->markAsSending();

    expect($notification->fresh()->status)->toBe(NotificationStatus::Sending);
});

test('notification calculates success rate', function () {
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

    expect($notification->getSuccessRate())->toBe(50.0);
});

test('message personalization replaces variables', function () {
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

    expect($notification)->not->toBeNull();
});

test('notification channel defaults to whatsapp', function () {
    $user = User::factory()->create();
    $contact = Contact::factory()->create();

    $notification = $this->service->create(
        user: $user,
        content: 'Default channel test',
        contactIds: [$contact->id],
    );

    expect($notification->channel)->toBe(MessagingChannel::WhatsApp);
});

test('notification can use telegram channel', function () {
    $user = User::factory()->create();
    $contact = Contact::factory()->telegram()->create();

    $notification = $this->service->create(
        user: $user,
        content: 'Telegram test',
        contactIds: [$contact->id],
        channel: MessagingChannel::Telegram,
    );

    expect($notification->channel)->toBe(MessagingChannel::Telegram);
});
