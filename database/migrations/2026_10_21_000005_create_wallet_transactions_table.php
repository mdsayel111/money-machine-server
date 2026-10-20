<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->decimal('amount', 12, 2);
            $table->boolean('is_positive')->default(true);
            $table->enum('type', ['task', 'referral', 'withdrawal', 'bonus'])->default('task');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            $table->string('reference_type')->nullable(); // e.g. task_submission, withdrawal_request, tier_upgrade
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
