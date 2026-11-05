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

        if (! Schema::hasColumn('notifications', 'type')) {
            DB::statement('ALTER TABLE `notifications` ADD COLUMN `type` varchar(50) DEFAULT NULL');
        }

        if (! Schema::hasColumn('notifications', 'message')) {
            DB::statement('ALTER TABLE `notifications` ADD COLUMN `message` text DEFAULT NULL');
        }

        if (Schema::hasColumn('notifications', 'type_notification')) {
            DB::statement('UPDATE `notifications` SET `type` = `type_notification` WHERE `type` IS NULL OR `type` = ""');
        }

        if (Schema::hasColumn('notifications', 'contenu')) {
            DB::statement('UPDATE `notifications` SET `message` = `contenu` WHERE `message` IS NULL OR `message` = ""');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('notifications', 'type')) {
            DB::statement('ALTER TABLE `notifications` DROP COLUMN `type`');
        }

        if (Schema::hasColumn('notifications', 'message')) {
            DB::statement('ALTER TABLE `notifications` DROP COLUMN `message`');
        }
    }
};
