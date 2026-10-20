<?php

namespace Database\Seeders;

use App\Models\MembershipTier;
use App\Models\PayoutMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Membership Tiers (Idempotent: updateOrCreate by slug)
        $silver = MembershipTier::updateOrCreate(
            ['slug' => 'silver'],
            [
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
            ]
        );

        $gold = MembershipTier::updateOrCreate(
            ['slug' => 'gold'],
            [
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
            ]
        );

        $platinum = MembershipTier::updateOrCreate(
            ['slug' => 'platinum'],
            [
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
            ]
        );

        $diamond = MembershipTier::updateOrCreate(
            ['slug' => 'diamond'],
            [
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
            ]
        );

        // 2. Real System Administrator & Super Admin
        $this->call(SuperAdminSeeder::class);

        // 3. Supported Payout Gateways (Idempotent: updateOrCreate by type)
        PayoutMethod::updateOrCreate(
            ['type' => 'bkash'],
            [
                'name' => 'bKash Personal',
                'account_detail' => 'bKash Personal Wallet',
                'fee_percent' => 2.50,
                'processing_time' => 'Instant',
                'is_active' => true,
            ]
        );

        PayoutMethod::updateOrCreate(
            ['type' => 'nagad'],
            [
                'name' => 'Nagad Personal',
                'account_detail' => 'Nagad Personal Wallet',
                'fee_percent' => 2.50,
                'processing_time' => 'Instant',
                'is_active' => true,
            ]
        );

        PayoutMethod::updateOrCreate(
            ['type' => 'bank'],
            [
                'name' => 'Bank Transfer',
                'account_detail' => 'Direct Bangladeshi Bank Account',
                'fee_percent' => 1.50,
                'processing_time' => '2-3 Business Days',
                'is_active' => true,
            ]
        );
    }
}
