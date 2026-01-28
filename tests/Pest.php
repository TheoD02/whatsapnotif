<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\DuskTestCase::class)
    ->use(DatabaseMigrations::class)
    ->in('Browser');

pest()->extend(Tests\TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Unit');
