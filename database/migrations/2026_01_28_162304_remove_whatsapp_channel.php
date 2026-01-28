<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing whatsapp contacts to telegram
        DB::table('contacts')
            ->where('preferred_channel', 'whatsapp')
            ->update(['preferred_channel' => 'telegram']);

        // Update existing whatsapp notifications to telegram
        DB::table('notifications')
            ->where('channel', 'whatsapp')
            ->update(['channel' => 'telegram']);
    }

    public function down(): void
    {
        // This migration is not reversible since we're removing whatsapp support
    }
};
