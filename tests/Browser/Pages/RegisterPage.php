<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class RegisterPage extends Page
{
    public function url(): string
    {
        return '/register';
    }

    public function assert(Browser $browser): void
    {
        $browser->assertPathIs($this->url());
    }

    /**
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@name' => 'input#name',
            '@email' => 'input#email',
            '@password' => 'input#password',
            '@password-confirmation' => 'input#password_confirmation',
            '@invitation-code' => 'input#invitation_code',
            '@submit' => 'button[type="submit"]',
            '@login-link' => 'a[href="/login"]',
        ];
    }

    public function register(Browser $browser, string $name, string $email, string $password, ?string $invitationCode = null): void
    {
        $browser->type('@name', $name)
            ->type('@email', $email)
            ->type('@password', $password)
            ->type('@password-confirmation', $password);

        if ($invitationCode) {
            $browser->type('@invitation-code', $invitationCode);
        }

        $browser->click('@submit');
    }
}
