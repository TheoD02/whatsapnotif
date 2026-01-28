<?php

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Group;
use App\Models\User;

test('user can be admin', function () {
    $user = User::factory()->admin()->create();

    expect($user->isAdmin())->toBeTrue();
    expect($user->isOperator())->toBeFalse();
});

test('user can be operator', function () {
    $user = User::factory()->operator()->create();

    expect($user->isOperator())->toBeTrue();
    expect($user->isAdmin())->toBeFalse();
});

test('user status can be active', function () {
    $user = User::factory()->create();

    expect($user->isActive())->toBeTrue();
    expect($user->isPending())->toBeFalse();
});

test('user status can be pending', function () {
    $user = User::factory()->pending()->create();

    expect($user->isPending())->toBeTrue();
    expect($user->isActive())->toBeFalse();
});

test('admin can access all groups', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();

    expect($admin->canAccessGroup($group))->toBeTrue();
});

test('operator can only access allowed groups', function () {
    $operator = User::factory()->operator()->create();
    $allowedGroup = Group::factory()->create();
    $restrictedGroup = Group::factory()->create();

    $operator->allowedGroups()->attach($allowedGroup);

    expect($operator->canAccessGroup($allowedGroup))->toBeTrue();
    expect($operator->canAccessGroup($restrictedGroup))->toBeFalse();
});

test('user role is cast to enum', function () {
    $user = User::factory()->admin()->create();

    expect($user->role)->toBeInstanceOf(UserRole::class);
    expect($user->role)->toBe(UserRole::Admin);
});

test('user status is cast to enum', function () {
    $user = User::factory()->pending()->create();

    expect($user->status)->toBeInstanceOf(UserStatus::class);
    expect($user->status)->toBe(UserStatus::Pending);
});

test('user can have inviter', function () {
    $inviter = User::factory()->admin()->create();
    $invitee = User::factory()->create(['invited_by' => $inviter->id]);

    expect($invitee->inviter->id)->toBe($inviter->id);
    expect($inviter->invitedUsers->pluck('id'))->toContain($invitee->id);
});
