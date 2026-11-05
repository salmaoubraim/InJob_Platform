<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }

        if (Schema::hasColumn('notifications', 'type_notification')) {
            DB::statement("ALTER TABLE `notifications` MODIFY `type_notification` VARCHAR(50) NOT NULL DEFAULT 'systeme'");
            if (Schema::hasColumn('notifications', 'type')) {
                DB::statement('UPDATE `notifications` SET `type_notification` = `type` WHERE `type` IS NOT NULL AND `type` != ""');
            }
        }

        if (Schema::hasColumn('notifications', 'type')) {
            DB::statement("ALTER TABLE `notifications` MODIFY `type` VARCHAR(50) NOT NULL DEFAULT 'systeme'");
        }
    }

    public function down(): void
    {
        // Pas de retour arrière : conserver VARCHAR pour supporter tous les types (contact, inscription, etc.).
    }
};
