<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_admin(): void
    {
        $user = User::factory()->admin()->create();

        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->isOperator());
    }

    public function test_user_can_be_operator(): void
    {
        $user = User::factory()->operator()->create();

        $this->assertTrue($user->isOperator());
        $this->assertFalse($user->isAdmin());
    }

    public function test_user_status_can_be_active(): void
    {
        $user = User::factory()->create();

        $this->assertTrue($user->isActive());
        $this->assertFalse($user->isPending());
    }

    public function test_user_status_can_be_pending(): void
    {
        $user = User::factory()->pending()->create();

        $this->assertTrue($user->isPending());
        $this->assertFalse($user->isActive());
    }

    public function test_admin_can_access_all_groups(): void
    {
        $admin = User::factory()->admin()->create();
        $group = Group::factory()->create();

        $this->assertTrue($admin->canAccessGroup($group));
    }

    public function test_operator_can_only_access_allowed_groups(): void
    {
        $operator = User::factory()->operator()->create();
        $allowedGroup = Group::factory()->create();
        $restrictedGroup = Group::factory()->create();

        $operator->allowedGroups()->attach($allowedGroup);

        $this->assertTrue($operator->canAccessGroup($allowedGroup));
        $this->assertFalse($operator->canAccessGroup($restrictedGroup));
    }

    public function test_user_role_is_cast_to_enum(): void
    {
        $user = User::factory()->admin()->create();

        $this->assertInstanceOf(UserRole::class, $user->role);
        $this->assertEquals(UserRole::Admin, $user->role);
    }

    public function test_user_status_is_cast_to_enum(): void
    {
        $user = User::factory()->pending()->create();

        $this->assertInstanceOf(UserStatus::class, $user->status);
        $this->assertEquals(UserStatus::Pending, $user->status);
    }

    public function test_user_can_have_inviter(): void
    {
        $inviter = User::factory()->admin()->create();
        $invitee = User::factory()->create(['invited_by' => $inviter->id]);

        $this->assertEquals($inviter->id, $invitee->inviter->id);
        $this->assertTrue($inviter->invitedUsers->contains($invitee));
    }
}
