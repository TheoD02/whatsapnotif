<?php

use App\Models\InvitationCode;
use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\Browser\Pages\RegisterPage;

test('register page is accessible', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit(new RegisterPage)
            ->assertSee('Créer un compte')
            ->assertSee('Votre compte devra être validé');
    });
});

test('user can register without invitation code', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit(new RegisterPage)
            ->on(new RegisterPage)
            ->register('John Doe', 'john@example.com', 'password123')
            ->waitForLocation('/pending-approval')
            ->assertPathIs('/pending-approval');
    });

    $this->assertDatabaseHas('users', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'status' => 'pending',
    ]);
});

test('user can register with valid invitation code', function () {
    $admin = User::factory()->admin()->create();
    $invitationCode = InvitationCode::generate($admin);

    $this->browse(function (Browser $browser) use ($invitationCode) {
        $browser->visit('/register')
            ->type('#name', 'Jane Doe')
            ->type('#email', 'jane@example.com')
            ->type('#password', 'password123')
            ->type('#password_confirmation', 'password123')
            ->type('#invitation_code', $invitationCode->code)
            ->click('button[type="submit"]')
            ->waitForLocation('/dashboard')
            ->assertPathIs('/dashboard');
    });

    $this->assertDatabaseHas('users', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'status' => 'active',
    ]);
});

test('register page shows valid code badge when url has valid code', function () {
    $admin = User::factory()->admin()->create();
    $invitationCode = InvitationCode::generate($admin);

    $this->browse(function (Browser $browser) use ($invitationCode) {
        $browser->visit('/register?code=' . $invitationCode->code)
            ->assertSee('Code valide')
            ->assertSee('Votre compte sera activé immédiatement');
    });
});

test('register shows validation errors', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit(new RegisterPage)
            ->on(new RegisterPage)
            ->register('', '', '')
            ->pause(500)
            ->assertPathIs('/register');
    });
});

test('register shows error for existing email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $this->browse(function (Browser $browser) {
        $browser->visit(new RegisterPage)
            ->on(new RegisterPage)
            ->register('Test User', 'existing@example.com', 'password123')
            ->waitForText('email')
            ->assertPathIs('/register');
    });
});

test('register shows error for password mismatch', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/register')
            ->type('#name', 'Test User')
            ->type('#email', 'test@example.com')
            ->type('#password', 'password123')
            ->type('#password_confirmation', 'different-password')
            ->click('button[type="submit"]')
            ->pause(500)
            ->assertPathIs('/register');
    });
});

test('user can navigate to login page', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit(new RegisterPage)
            ->click('@login-link')
            ->waitForLocation('/login')
            ->assertPathIs('/login');
    });
});
