<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('utilisateurs')) {
            return;
        }

        if (! Schema::hasColumn('utilisateurs', 'google_id')) {
            DB::statement('ALTER TABLE `utilisateurs` ADD COLUMN `google_id` varchar(128) NULL AFTER `email`');
            DB::statement('ALTER TABLE `utilisateurs` ADD UNIQUE KEY `utilisateurs_google_id_unique` (`google_id`)');
        }

        if (! Schema::hasColumn('utilisateurs', 'auth_provider')) {
            DB::statement("ALTER TABLE `utilisateurs` ADD COLUMN `auth_provider` varchar(20) NOT NULL DEFAULT 'local' AFTER `google_id`");
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('utilisateurs', 'auth_provider')) {
            DB::statement('ALTER TABLE `utilisateurs` DROP COLUMN `auth_provider`');
        }
        if (Schema::hasColumn('utilisateurs', 'google_id')) {
            DB::statement('ALTER TABLE `utilisateurs` DROP INDEX `utilisateurs_google_id_unique`');
            DB::statement('ALTER TABLE `utilisateurs` DROP COLUMN `google_id`');
        }
    }
};
