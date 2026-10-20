<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // e.g. "joined L1", "earned commission", "upgraded to Platinum"
            $table->string('badge_text')->nullable(); // e.g. "NEW"
            $table->enum('badge_type', ['new', 'success', 'warning'])->default('new');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('amount_prefix')->default('+ ');
            $table->boolean('is_positive')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_activities');
    }
};
