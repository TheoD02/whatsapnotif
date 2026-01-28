<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin,
            'status' => UserStatus::Active,
        ]);

        // Create sample operator
        User::create([
            'name' => 'Operator',
            'email' => 'operator@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Operator,
            'status' => UserStatus::Active,
        ]);
    }
}
