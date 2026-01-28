<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telegram_link_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('token', 32)->unique();
            $table->string('code', 6)->unique();
            $table->foreignId('contact_id')->constrained()->onDelete('cascade');
            $table->string('telegram_chat_id')->nullable();
            $table->enum('status', ['pending', 'linked', 'expired'])->default('pending');
            $table->timestamp('linked_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['token', 'status']);
            $table->index(['code', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telegram_link_tokens');
    }
};
