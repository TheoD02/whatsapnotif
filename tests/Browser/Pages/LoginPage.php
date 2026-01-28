<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class LoginPage extends Page
{
    public function url(): string
    {
        return '/login';
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
            '@email' => 'input#email',
            '@password' => 'input#password',
            '@remember' => '#remember',
            '@submit' => 'button[type="submit"]',
            '@register-link' => 'a[href="/register"]',
        ];
    }

    public function login(Browser $browser, string $email, string $password, bool $remember = false): void
    {
        $browser->type('@email', $email)
            ->type('@password', $password);

        if ($remember) {
            $browser->check('@remember');
        }

        $browser->click('@submit');
    }
}
