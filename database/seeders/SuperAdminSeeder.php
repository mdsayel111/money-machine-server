<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the Super Admin account into the database.
     */
    public function run(): void
    {
        // 1. Primary Super Admin (Notation-IT convention: username 'super-admin', password 'super-admin')
        User::updateOrCreate(
            ['email' => 'superadmin@moneymachine.com'],
            [
                'name' => 'Super Admin',
                'user_code' => 'super-admin',
                'password' => Hash::make('super-admin'),
                'role' => 'super-admin',
                'available_balance' => 0.00,
                'today_earnings' => 0.00,
                'pending_rewards' => 0.00,
                'lifetime_earnings' => 0.00,
                'level' => 1,
                'level_progress' => 100,
                'referral_code' => 'SUPERADMIN',
                'is_active' => true,
            ]
        );

        // 2. Standard Admin Account
        User::updateOrCreate(
            ['email' => 'admin@moneymachine.com'],
            [
                'name' => 'System Admin',
                'user_code' => 'ADM-001',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'available_balance' => 0.00,
                'today_earnings' => 0.00,
                'pending_rewards' => 0.00,
                'lifetime_earnings' => 0.00,
                'level' => 1,
                'level_progress' => 100,
                'referral_code' => 'ADMIN-SYS',
                'is_active' => true,
            ]
        );
    }
}
