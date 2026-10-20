<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('platform')->default('youtube'); // youtube, facebook, app, tiktok, survey
            $table->string('category')->default('social'); // all, social, app, survey
            $table->json('tags')->nullable(); // e.g. ["SOCIAL", "TRENDING"]
            $table->decimal('reward', 10, 2)->default(5.00);
            $table->string('reward_suffix')->default('/ Per task');
            $table->string('time_estimate')->default('2 mins');
            $table->string('remaining_slots')->default('200+ left');
            $table->string('limit_notice')->nullable(); // e.g. "Limit: 5/day", "Bonus: 1.5x"
            $table->text('description')->nullable();
            $table->string('action_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
