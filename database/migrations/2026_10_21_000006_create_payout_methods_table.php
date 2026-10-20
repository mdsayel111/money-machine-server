<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. bKash Personal, Nagad Wallet, Bank Transfer
            $table->string('type'); // bkash, nagad, bank
            $table->string('account_detail')->nullable(); // e.g. "017****5482"
            $table->decimal('fee_percent', 5, 2)->default(2.50);
            $table->string('processing_time')->default('Instant');
            $table->string('icon_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_methods');
    }
};
