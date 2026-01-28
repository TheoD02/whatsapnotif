<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('preferred_channel')->default('whatsapp');
            $table->string('telegram_chat_id')->nullable();
            $table->string('phone')->nullable()->change();
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->unique('phone');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['preferred_channel', 'telegram_chat_id']);
            $table->string('phone')->nullable(false)->change();
        });
    }
};
