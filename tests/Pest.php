<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\DuskTestCase;
use Tests\TestCase;

pest()->extend(DuskTestCase::class)
    ->use(DatabaseMigrations::class)
    ->in('Browser');

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Unit');
