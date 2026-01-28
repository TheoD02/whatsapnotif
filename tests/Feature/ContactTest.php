<?php

namespace Tests\Feature;

use App\Enums\MessagingChannel;
use App\Models\Contact;
use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_contacts_list(): void
    {
        $admin = User::factory()->admin()->create();
        Contact::factory()->count(5)->create();

        $response = $this->actingAs($admin)->get('/admin/contacts');

        $response->assertStatus(200);
    }

    public function test_admin_can_create_whatsapp_contact(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/contacts', [
            'name' => 'John Doe',
            'phone' => '0612345678',
            'preferred_channel' => MessagingChannel::WhatsApp->value,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contacts', [
            'name' => 'John Doe',
            'phone' => '+33612345678',
            'preferred_channel' => MessagingChannel::WhatsApp->value,
        ]);
    }

    public function test_admin_can_create_telegram_contact(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/contacts', [
            'name' => 'Jane Doe',
            'preferred_channel' => MessagingChannel::Telegram->value,
            'telegram_chat_id' => '123456789',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contacts', [
            'name' => 'Jane Doe',
            'preferred_channel' => MessagingChannel::Telegram->value,
            'telegram_chat_id' => '123456789',
        ]);
    }

    public function test_admin_can_update_contact(): void
    {
        $admin = User::factory()->admin()->create();
        $contact = Contact::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($admin)->put("/admin/contacts/{$contact->id}", [
            'name' => 'New Name',
            'phone' => $contact->phone,
            'preferred_channel' => $contact->preferred_channel->value,
        ]);

        $response->assertRedirect();
        $this->assertEquals('New Name', $contact->fresh()->name);
    }

    public function test_admin_can_delete_contact(): void
    {
        $admin = User::factory()->admin()->create();
        $contact = Contact::factory()->create();

        $response = $this->actingAs($admin)->delete("/admin/contacts/{$contact->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }

    public function test_admin_can_assign_contact_to_groups(): void
    {
        $admin = User::factory()->admin()->create();
        $group = Group::factory()->create();

        $response = $this->actingAs($admin)->post('/admin/contacts', [
            'name' => 'Grouped Contact',
            'phone' => '0698765432',
            'preferred_channel' => MessagingChannel::WhatsApp->value,
            'group_ids' => [$group->id],
        ]);

        $response->assertRedirect();
        $contact = Contact::where('name', 'Grouped Contact')->first();
        $this->assertTrue($contact->groups->contains($group));
    }

    public function test_contact_phone_is_formatted_correctly(): void
    {
        $this->assertEquals('+33612345678', Contact::formatPhone('0612345678'));
        $this->assertEquals('+33612345678', Contact::formatPhone('06 12 34 56 78'));
        $this->assertEquals('+33612345678', Contact::formatPhone('+33612345678'));
        $this->assertEquals('+1234567890', Contact::formatPhone('1234567890'));
    }

    public function test_contact_search_filter_works(): void
    {
        $admin = User::factory()->admin()->create();
        Contact::factory()->create(['name' => 'Alice Smith']);
        Contact::factory()->create(['name' => 'Bob Jones']);

        $response = $this->actingAs($admin)->get('/admin/contacts?search=Alice');

        $response->assertStatus(200);
        $response->assertSee('Alice Smith');
        $response->assertDontSee('Bob Jones');
    }

    public function test_contact_group_filter_works(): void
    {
        $admin = User::factory()->admin()->create();
        $group = Group::factory()->create();

        $contactInGroup = Contact::factory()->create(['name' => 'In Group']);
        $contactInGroup->groups()->attach($group);

        $contactOutside = Contact::factory()->create(['name' => 'Outside Group']);

        $response = $this->actingAs($admin)->get("/admin/contacts?group={$group->id}");

        $response->assertStatus(200);
        $response->assertSee('In Group');
        $response->assertDontSee('Outside Group');
    }

    public function test_operator_cannot_access_contact_management(): void
    {
        $operator = User::factory()->operator()->create();

        $response = $this->actingAs($operator)->get('/admin/contacts');

        $response->assertStatus(403);
    }
}
