<?php

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;

test('guest can view login page', function () {
    $this->get('/login')->assertStatus(200);
});

test('guest can view register page', function () {
    $this->get('/register')->assertStatus(200);
});

test('user can login with correct credentials', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect();

    $this->assertAuthenticatedAs($user);
});

test('user cannot login with incorrect password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('authenticated user can logout', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect();

    $this->assertGuest();
});

test('pending user is redirected to pending approval page', function () {
    $user = User::factory()->pending()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect('/pending-approval');
});

test('active user can access dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertStatus(200);
});

test('admin can access admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/admin')
        ->assertStatus(200);
});

test('operator cannot access admin dashboard', function () {
    $operator = User::factory()->operator()->create();

    $this->actingAs($operator)
        ->get('/admin')
        ->assertStatus(403);
});

test('admin can approve pending user', function () {
    $admin = User::factory()->admin()->create();
    $pendingUser = User::factory()->pending()->create();

    $this->actingAs($admin)
        ->post("/admin/users/{$pendingUser->id}/approve")
        ->assertRedirect();

    expect($pendingUser->fresh()->status)->toBe(UserStatus::Active);
});

test('admin can reject pending user', function () {
    $admin = User::factory()->admin()->create();
    $pendingUser = User::factory()->pending()->create();

    $this->actingAs($admin)
        ->post("/admin/users/{$pendingUser->id}/reject")
        ->assertRedirect();

    expect($pendingUser->fresh()->status)->toBe(UserStatus::Rejected);
});

test('admin can change user role', function () {
    $admin = User::factory()->admin()->create();
    $operator = User::factory()->operator()->create();

    $this->actingAs($admin)
        ->put("/admin/users/{$operator->id}/role", [
            'role' => UserRole::Admin->value,
        ])
        ->assertRedirect();

    expect($operator->fresh()->role)->toBe(UserRole::Admin);
});
