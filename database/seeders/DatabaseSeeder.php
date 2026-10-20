<?php

namespace Database\Seeders;

use App\Models\MembershipTier;
use App\Models\NetworkActivity;
use App\Models\PayoutMethod;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Membership Tiers
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

        // 2. Admin User
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@moneymachine.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'user_code' => 'ADM-001',
            'tier_id' => $diamond->id,
            'tier_level' => 'Diamond',
            'available_balance' => 999999.00,
            'level' => 10,
            'referral_code' => 'ADMIN-ROOT',
            'is_active' => true,
        ]);

        // 3. Current Demo User (Rahat Chowdhury)
        $rahat = User::create([
            'name' => 'Rahat Chowdhury',
            'email' => 'rahat.chowdhury@email.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_code' => 'ERN-1024',
            'phone' => '01712345678',
            'avatar_url' => '/avatars/rahat.jpg',
            'tier_id' => $gold->id,
            'tier_level' => 'Gold',
            'available_balance' => 12450.50,
            'today_earnings' => 320.00,
            'pending_rewards' => 1200.00,
            'lifetime_earnings' => 45200.00,
            'level' => 6,
            'level_progress' => 65,
            'referral_code' => 'EARN-99X-BD',
            'tasks_completed_count' => 1240,
            'is_active' => true,
        ]);

        // 4. L1 Referrals for Rahat
        $tanvir = User::create([
            'name' => 'Tanvir Ahmed',
            'email' => 'tanvir@email.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_code' => 'ERN-1025',
            'avatar_url' => '/avatars/tanvir.jpg',
            'tier_id' => $gold->id,
            'tier_level' => 'Gold',
            'referred_by_id' => $rahat->id,
            'referral_code' => 'TANVIR-L1',
            'available_balance' => 3500.00,
            'is_active' => true,
        ]);

        $sumaiya = User::create([
            'name' => 'Sumaiya Begum',
            'email' => 'sumaiya@email.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_code' => 'ERN-1026',
            'avatar_url' => '/avatars/sumaiya.jpg',
            'tier_id' => $silver->id,
            'tier_level' => 'Silver',
            'referred_by_id' => $rahat->id,
            'referral_code' => 'SUMAIYA-L1',
            'available_balance' => 1200.00,
            'is_active' => true,
        ]);

        $kamal = User::create([
            'name' => 'Kamal Hossain',
            'email' => 'kamal@email.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_code' => 'ERN-1027',
            'avatar_url' => '/avatars/tanvir.jpg',
            'tier_id' => $platinum->id,
            'tier_level' => 'Platinum',
            'referred_by_id' => $rahat->id,
            'referral_code' => 'KAMAL-L1',
            'available_balance' => 8900.00,
            'is_active' => true,
        ]);

        // 5. L2 Referrals (referred by Kamal & Sumaiya)
        User::create([
            'name' => 'Ariful Islam',
            'email' => 'ariful@email.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_code' => 'ERN-2001',
            'avatar_url' => '/avatars/tanvir.jpg',
            'tier_id' => $silver->id,
            'tier_level' => 'Silver',
            'referred_by_id' => $kamal->id,
            'referral_code' => 'ARIF-L2',
            'available_balance' => 450.00,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Nusrat Jahan',
            'email' => 'nusrat@email.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_code' => 'ERN-2002',
            'avatar_url' => '/avatars/sumaiya.jpg',
            'tier_id' => $silver->id,
            'tier_level' => 'Silver',
            'referred_by_id' => $kamal->id,
            'referral_code' => 'NUSRAT-L2',
            'available_balance' => 780.00,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Rakib Hassan',
            'email' => 'rakib@email.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_code' => 'ERN-2003',
            'avatar_url' => '/avatars/tanvir.jpg',
            'tier_id' => $silver->id,
            'tier_level' => 'Silver',
            'referred_by_id' => $sumaiya->id,
            'referral_code' => 'RAKIB-L2',
            'available_balance' => 310.00,
            'is_active' => true,
        ]);

        // 6. Tasks
        Task::create([
            'title' => 'Watch Video & Earn',
            'platform' => 'youtube',
            'category' => 'social',
            'tags' => ['SOCIAL', 'TRENDING'],
            'reward' => 15.00,
            'reward_suffix' => '/ Per task',
            'time_estimate' => '2 mins',
            'remaining_slots' => '145 left',
            'limit_notice' => 'Bonus: 1.5x',
            'description' => 'Watch the sponsored YouTube video for at least 90 seconds and like the video.',
            'action_url' => 'https://youtube.com',
            'is_featured' => true,
            'is_active' => true,
        ]);

        Task::create([
            'title' => 'Share Daily Post',
            'platform' => 'facebook',
            'category' => 'social',
            'tags' => ['SOCIAL'],
            'reward' => 5.00,
            'reward_suffix' => '/ Per share',
            'time_estimate' => '30s',
            'remaining_slots' => '200+ left',
            'limit_notice' => 'Limit: 5/day',
            'description' => 'Share our campaign banner on your Facebook timeline with public visibility.',
            'action_url' => 'https://facebook.com',
            'is_featured' => true,
            'is_active' => true,
        ]);

        Task::create([
            'title' => 'App Review Reward',
            'platform' => 'app',
            'category' => 'app',
            'tags' => ['APP', 'HIGH REWARD'],
            'reward' => 50.00,
            'reward_suffix' => '/ Once',
            'time_estimate' => '5 mins',
            'remaining_slots' => '80 left',
            'limit_notice' => 'One-time',
            'description' => 'Download the partner mobile app from Play Store and submit a 5-star review.',
            'action_url' => 'https://play.google.com',
            'is_featured' => true,
            'is_active' => true,
        ]);

        Task::create([
            'title' => 'Follow TikTok Account',
            'platform' => 'tiktok',
            'category' => 'social',
            'tags' => ['SOCIAL'],
            'reward' => 4.00,
            'reward_suffix' => '/ Once',
            'time_estimate' => '15s',
            'remaining_slots' => '350+ left',
            'limit_notice' => 'New Task',
            'description' => 'Follow the specified TikTok profile and like the top 3 videos.',
            'action_url' => 'https://tiktok.com',
            'is_featured' => false,
            'is_active' => true,
        ]);

        Task::create([
            'title' => 'Quick Brand Survey',
            'platform' => 'survey',
            'category' => 'survey',
            'tags' => ['SURVEY'],
            'reward' => 120.00,
            'reward_suffix' => '/ Once',
            'time_estimate' => '10m',
            'remaining_slots' => '25 left',
            'limit_notice' => '20 Questions',
            'description' => 'Complete a 20-question demographic and consumer preferences survey.',
            'action_url' => 'https://survey.example.com',
            'is_featured' => false,
            'is_active' => true,
        ]);

        // 7. Payout Methods
        $bkash = PayoutMethod::create([
            'name' => 'bKash Personal',
            'type' => 'bkash',
            'account_detail' => '017****5482',
            'fee_percent' => 2.50,
            'processing_time' => 'Instant (bKash)',
            'is_active' => true,
        ]);

        $nagad = PayoutMethod::create([
            'name' => 'Nagad Wallet',
            'type' => 'nagad',
            'account_detail' => 'Add new number',
            'fee_percent' => 2.50,
            'processing_time' => 'Instant',
            'is_active' => true,
        ]);

        $bank = PayoutMethod::create([
            'name' => 'Bank Transfer',
            'type' => 'bank',
            'account_detail' => 'Process: 2-3 Days',
            'fee_percent' => 1.50,
            'processing_time' => '2-3 Days',
            'is_active' => true,
        ]);

        // 8. Wallet Transactions for Rahat
        WalletTransaction::create([
            'user_id' => $rahat->id,
            'title' => 'Task Reward',
            'subtitle' => 'Watch & Like Video',
            'amount' => 15.00,
            'is_positive' => true,
            'type' => 'task',
            'status' => 'completed',
        ]);

        WalletTransaction::create([
            'user_id' => $rahat->id,
            'title' => 'Referral Commission',
            'subtitle' => 'From Tanvir (L1)',
            'amount' => 4.80,
            'is_positive' => true,
            'type' => 'referral',
            'status' => 'completed',
        ]);

        WalletTransaction::create([
            'user_id' => $rahat->id,
            'title' => 'Withdrawal (bKash)',
            'subtitle' => 'Processing...',
            'amount' => 2500.00,
            'is_positive' => false,
            'type' => 'withdrawal',
            'status' => 'pending',
        ]);

        WalletTransaction::create([
            'user_id' => $rahat->id,
            'title' => 'Network Bonus',
            'subtitle' => 'Weekly Milestone',
            'amount' => 500.00,
            'is_positive' => true,
            'type' => 'bonus',
            'status' => 'completed',
        ]);

        // 9. Withdrawal Request
        WithdrawalRequest::create([
            'user_id' => $rahat->id,
            'payout_method_id' => $bkash->id,
            'payout_type' => 'bkash',
            'account_number' => '01712345482',
            'amount' => 2500.00,
            'fee' => 62.50,
            'net_amount' => 2437.50,
            'status' => 'pending',
            'admin_notes' => 'Awaiting disbursement via bKash Merchant API',
        ]);

        // 10. Network Activities
        NetworkActivity::create([
            'user_id' => $rahat->id,
            'actor_user_id' => $tanvir->id,
            'action' => 'joined L1',
            'badge_text' => 'NEW',
            'badge_type' => 'new',
        ]);

        NetworkActivity::create([
            'user_id' => $rahat->id,
            'actor_user_id' => $sumaiya->id,
            'action' => 'earned commission',
            'amount' => 4.50,
            'amount_prefix' => '+ ',
            'is_positive' => true,
            'badge_type' => 'success',
        ]);

        NetworkActivity::create([
            'user_id' => $rahat->id,
            'actor_user_id' => $kamal->id,
            'action' => 'upgraded to Platinum',
            'amount' => 250.00,
            'amount_prefix' => '+ ',
            'is_positive' => true,
            'badge_type' => 'warning',
        ]);
    }
}
