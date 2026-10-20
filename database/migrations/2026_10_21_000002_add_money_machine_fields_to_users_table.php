<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('password'); // admin or user
            $table->string('user_code')->nullable()->unique()->after('id'); // e.g. ERN-1024
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_url')->nullable()->after('phone');
            $table->foreignId('tier_id')->nullable()->after('avatar_url')->constrained('membership_tiers')->nullOnDelete();
            $table->string('tier_level')->default('Silver')->after('tier_id'); // Silver, Gold, Platinum, Diamond
            $table->decimal('available_balance', 12, 2)->default(0.00)->after('tier_level');
            $table->decimal('today_earnings', 12, 2)->default(0.00)->after('available_balance');
            $table->decimal('pending_rewards', 12, 2)->default(0.00)->after('today_earnings');
            $table->decimal('lifetime_earnings', 12, 2)->default(0.00)->after('pending_rewards');
            $table->integer('level')->default(1)->after('lifetime_earnings');
            $table->integer('level_progress')->default(10)->after('level'); // percentage 0-100
            $table->string('referral_code')->nullable()->unique()->after('level_progress');
            $table->foreignId('referred_by_id')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
            $table->integer('tasks_completed_count')->default(0)->after('referred_by_id');
            $table->boolean('is_active')->default(true)->after('tasks_completed_count');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tier_id']);
            $table->dropForeign(['referred_by_id']);
            $table->dropColumn([
                'role',
                'user_code',
                'phone',
                'avatar_url',
                'tier_id',
                'tier_level',
                'available_balance',
                'today_earnings',
                'pending_rewards',
                'lifetime_earnings',
                'level',
                'level_progress',
                'referral_code',
                'referred_by_id',
                'tasks_completed_count',
                'is_active',
            ]);
        });
    }
};
