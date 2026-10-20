<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // silver, gold, platinum, diamond
            $table->string('name'); // Silver, Gold, Platinum, Diamond
            $table->string('subtitle');
            $table->decimal('price', 10, 2)->default(0);
            $table->string('price_text')->default('Free');
            $table->integer('daily_tasks_limit')->default(5); // -1 for unlimited
            $table->decimal('referral_commission_rate', 5, 2)->default(5.00); // percentage
            $table->decimal('withdrawal_fee_percent', 5, 2)->default(2.50);
            $table->boolean('vip_support')->default(false);
            $table->boolean('instant_payouts')->default(false);
            $table->string('badge_bg')->nullable();
            $table->string('badge_text_color')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_tiers');
    }
};
