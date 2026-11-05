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

        if (Schema::hasColumn('notifications', 'contenu')) {
            DB::statement('ALTER TABLE `notifications` MODIFY `contenu` text NULL');
            if (Schema::hasColumn('notifications', 'message')) {
                DB::statement('UPDATE `notifications` SET `contenu` = `message` WHERE `contenu` IS NULL OR `contenu` = ""');
            }
        }

        if (Schema::hasColumn('notifications', 'type_notification')) {
            DB::statement('ALTER TABLE `notifications` MODIFY `type_notification` varchar(50) NULL');
            if (Schema::hasColumn('notifications', 'type')) {
                DB::statement('UPDATE `notifications` SET `type_notification` = `type` WHERE `type_notification` IS NULL OR `type_notification` = ""');
            }
        }
    }

    public function down(): void
    {
        // Pas de retour arrière : contenu/type_notification peuvent rester nullable.
    }
};
