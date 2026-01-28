<?php

use App\Enums\MessagingChannel;
use App\Models\Contact;
use App\Models\Group;
use App\Models\User;

test('admin can view contacts list', function () {
    $admin = User::factory()->admin()->create();
    Contact::factory()->count(5)->create();

    $this->actingAs($admin)
        ->get('/admin/contacts')
        ->assertStatus(200);
});

test('admin can create whatsapp contact', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post('/admin/contacts', [
            'name' => 'John Doe',
            'phone' => '0612345678',
            'preferred_channel' => MessagingChannel::WhatsApp->value,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('contacts', [
        'name' => 'John Doe',
        'phone' => '+33612345678',
        'preferred_channel' => MessagingChannel::WhatsApp->value,
    ]);
});

test('admin can create telegram contact', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post('/admin/contacts', [
            'name' => 'Jane Doe',
            'preferred_channel' => MessagingChannel::Telegram->value,
            'telegram_chat_id' => '123456789',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('contacts', [
        'name' => 'Jane Doe',
        'preferred_channel' => MessagingChannel::Telegram->value,
        'telegram_chat_id' => '123456789',
    ]);
});

test('admin can update contact', function () {
    $admin = User::factory()->admin()->create();
    $contact = Contact::factory()->create(['name' => 'Old Name']);

    $this->actingAs($admin)
        ->put("/admin/contacts/{$contact->id}", [
            'name' => 'New Name',
            'phone' => $contact->phone,
            'preferred_channel' => $contact->preferred_channel->value,
        ])
        ->assertRedirect();

    expect($contact->fresh()->name)->toBe('New Name');
});

test('admin can delete contact', function () {
    $admin = User::factory()->admin()->create();
    $contact = Contact::factory()->create();

    $this->actingAs($admin)
        ->delete("/admin/contacts/{$contact->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
});

test('admin can assign contact to groups', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/contacts', [
            'name' => 'Grouped Contact',
            'phone' => '0698765432',
            'preferred_channel' => MessagingChannel::WhatsApp->value,
            'group_ids' => [$group->id],
        ])
        ->assertRedirect();

    $contact = Contact::where('name', 'Grouped Contact')->first();
    expect($contact->groups->pluck('id'))->toContain($group->id);
});

test('contact phone is formatted correctly', function () {
    expect(Contact::formatPhone('0612345678'))->toBe('+33612345678');
    expect(Contact::formatPhone('06 12 34 56 78'))->toBe('+33612345678');
    expect(Contact::formatPhone('+33612345678'))->toBe('+33612345678');
    expect(Contact::formatPhone('1234567890'))->toBe('+1234567890');
});

test('contact search filter works', function () {
    $admin = User::factory()->admin()->create();
    Contact::factory()->create(['name' => 'Alice Smith']);
    Contact::factory()->create(['name' => 'Bob Jones']);

    $this->actingAs($admin)
        ->get('/admin/contacts?search=Alice')
        ->assertStatus(200)
        ->assertSee('Alice Smith')
        ->assertDontSee('Bob Jones');
});

test('contact group filter works', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();

    $contactInGroup = Contact::factory()->create(['name' => 'In Group']);
    $contactInGroup->groups()->attach($group);

    Contact::factory()->create(['name' => 'Outside Group']);

    $this->actingAs($admin)
        ->get("/admin/contacts?group={$group->id}")
        ->assertStatus(200)
        ->assertSee('In Group')
        ->assertDontSee('Outside Group');
});

test('operator cannot access contact management', function () {
    $operator = User::factory()->operator()->create();

    $this->actingAs($operator)
        ->get('/admin/contacts')
        ->assertStatus(403);
});
