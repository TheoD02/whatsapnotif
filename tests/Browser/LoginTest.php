<?php

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\Browser\Pages\LoginPage;

test('login page is accessible', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit(new LoginPage)
            ->assertSee('Connexion')
            ->assertSee('Entrez vos identifiants');
    });
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create();

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit(new LoginPage)
            ->on(new LoginPage)
            ->login($user->email, 'password')
            ->waitForLocation('/dashboard')
            ->assertPathIs('/dashboard');
    });
});

test('admin is redirected to admin dashboard after login', function () {
    $admin = User::factory()->admin()->create();

    $this->browse(function (Browser $browser) use ($admin) {
        $browser->visit(new LoginPage)
            ->on(new LoginPage)
            ->login($admin->email, 'password')
            ->waitForLocation('/admin')
            ->assertPathIs('/admin');
    });
});

test('user cannot login with invalid credentials', function () {
    $user = User::factory()->create();

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit(new LoginPage)
            ->on(new LoginPage)
            ->login($user->email, 'wrong-password')
            ->waitForText('Ces identifiants ne correspondent pas')
            ->assertPathIs('/login')
            ->assertSee('Ces identifiants ne correspondent pas');
    });
});

test('pending user is redirected to pending approval page', function () {
    $user = User::factory()->pending()->create();

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit(new LoginPage)
            ->on(new LoginPage)
            ->login($user->email, 'password')
            ->waitForLocation('/pending-approval')
            ->assertPathIs('/pending-approval');
    });
});

test('user can navigate to register page', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit(new LoginPage)
            ->click('@register-link')
            ->waitForLocation('/register')
            ->assertPathIs('/register');
    });
});

test('remember me checkbox works', function () {
    $user = User::factory()->create();

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit(new LoginPage)
            ->on(new LoginPage)
            ->login($user->email, 'password', remember: true)
            ->waitForLocation('/dashboard')
            ->assertPathIs('/dashboard')
            ->assertCookieExists('remember_web_' . sha1(\App\Models\User::class));
    });
});
