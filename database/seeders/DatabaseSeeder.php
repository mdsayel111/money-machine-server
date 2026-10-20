<?php

namespace Database\Seeders;

use App\Models\MembershipTier;
use App\Models\PayoutMethod;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Membership Tiers (System configurations)
        $silver = MembershipTier::create([
            'slug' => 'silver',
            'name' => 'Silver',
            'subtitle' => 'Beginner Level',
            'price' => 0.00,
            'price_text' => 'Free',
            'daily_tasks_limit' => 5,
            'referral_commission_rate' => 5.00,
            'withdrawal_fee_percent' => 2.50,
            'vip_support' => false,
            'instant_payouts' => false,
            'badge_bg' => 'bg-slate-100',
            'badge_text_color' => 'text-slate-700',
            'is_active' => true,
        ]);

        $gold = MembershipTier::create([
            'slug' => 'gold',
            'name' => 'Gold',
            'subtitle' => 'Standard Level',
            'price' => 2500.00,
            'price_text' => '৳ 2,500/yr',
            'daily_tasks_limit' => 20,
            'referral_commission_rate' => 12.00,
            'withdrawal_fee_percent' => 2.50,
            'vip_support' => false,
            'instant_payouts' => false,
            'badge_bg' => 'bg-amber-100',
            'badge_text_color' => 'text-amber-800',
            'is_active' => true,
        ]);

        $platinum = MembershipTier::create([
            'slug' => 'platinum',
            'name' => 'Platinum',
            'subtitle' => 'Professional Level',
            'price' => 10000.00,
            'price_text' => '৳ 10,000/yr',
            'daily_tasks_limit' => 50,
            'referral_commission_rate' => 20.00,
            'withdrawal_fee_percent' => 1.50,
            'vip_support' => true,
            'instant_payouts' => false,
            'badge_bg' => 'bg-indigo-100',
            'badge_text_color' => 'text-indigo-800',
            'is_active' => true,
        ]);

        $diamond = MembershipTier::create([
            'slug' => 'diamond',
            'name' => 'Diamond',
            'subtitle' => 'Elite Level',
            'price' => 50000.00,
            'price_text' => '৳ 50,000/yr',
            'daily_tasks_limit' => -1, // Unlimited
            'referral_commission_rate' => 30.00,
            'withdrawal_fee_percent' => 0.00,
            'vip_support' => true,
            'instant_payouts' => true,
            'badge_bg' => 'bg-purple-100',
            'badge_text_color' => 'text-purple-800',
            'is_active' => true,
        ]);

        // 2. Real System Administrator (required for admin portal authentication)
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@moneymachine.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'user_code' => 'ADM-001',
            'tier_id' => $diamond->id,
            'tier_level' => 'Diamond',
            'available_balance' => 0.00,
            'level' => 10,
            'referral_code' => 'ADMIN-ROOT',
            'is_active' => true,
        ]);

        // 3. Supported Payout Gateways
        PayoutMethod::create([
            'name' => 'bKash Personal',
            'type' => 'bkash',
            'account_detail' => 'bKash Personal Wallet',
            'fee_percent' => 2.50,
            'processing_time' => 'Instant',
            'is_active' => true,
        ]);

        PayoutMethod::create([
            'name' => 'Nagad Personal',
            'type' => 'nagad',
            'account_detail' => 'Nagad Personal Wallet',
            'fee_percent' => 2.50,
            'processing_time' => 'Instant',
            'is_active' => true,
        ]);

        PayoutMethod::create([
            'name' => 'Bank Transfer',
            'type' => 'bank',
            'account_detail' => 'Direct Bangladeshi Bank Account',
            'fee_percent' => 1.50,
            'processing_time' => '2-3 Business Days',
            'is_active' => true,
        ]);
    }
}
