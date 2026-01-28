<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_login_page(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_guest_can_view_register_page(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_incorrect_password(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect();
        $this->assertGuest();
    }

    public function test_pending_user_is_redirected_to_pending_approval_page(): void
    {
        $user = User::factory()->pending()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect('/pending-approval');
    }

    public function test_active_user_can_access_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
    }

    public function test_operator_cannot_access_admin_dashboard(): void
    {
        $operator = User::factory()->operator()->create();

        $response = $this->actingAs($operator)->get('/admin');

        $response->assertStatus(403);
    }

    public function test_admin_can_approve_pending_user(): void
    {
        $admin = User::factory()->admin()->create();
        $pendingUser = User::factory()->pending()->create();

        $response = $this->actingAs($admin)->post("/admin/users/{$pendingUser->id}/approve");

        $response->assertRedirect();
        $this->assertEquals(UserStatus::Active, $pendingUser->fresh()->status);
    }

    public function test_admin_can_reject_pending_user(): void
    {
        $admin = User::factory()->admin()->create();
        $pendingUser = User::factory()->pending()->create();

        $response = $this->actingAs($admin)->post("/admin/users/{$pendingUser->id}/reject");

        $response->assertRedirect();
        $this->assertEquals(UserStatus::Rejected, $pendingUser->fresh()->status);
    }

    public function test_admin_can_change_user_role(): void
    {
        $admin = User::factory()->admin()->create();
        $operator = User::factory()->operator()->create();

        $response = $this->actingAs($admin)->put("/admin/users/{$operator->id}/role", [
            'role' => UserRole::Admin->value,
        ]);

        $response->assertRedirect();
        $this->assertEquals(UserRole::Admin, $operator->fresh()->role);
    }
}
