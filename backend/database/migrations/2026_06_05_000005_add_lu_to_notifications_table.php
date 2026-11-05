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

        if (! Schema::hasColumn('notifications', 'lien')) {
            DB::statement('ALTER TABLE `notifications` ADD COLUMN `lien` varchar(500) DEFAULT NULL');
        }

        if (! Schema::hasColumn('notifications', 'lu')) {
            DB::statement('ALTER TABLE `notifications` ADD COLUMN `lu` tinyint(1) NOT NULL DEFAULT 0');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('notifications', 'lu')) {
            DB::statement('ALTER TABLE `notifications` DROP COLUMN `lu`');
        }
    }
};
