<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('contact_messages')) {
            return;
        }

        if (! Schema::hasColumn('contact_messages', 'statut')) {
            DB::statement("ALTER TABLE `contact_messages` ADD COLUMN `statut` varchar(20) NOT NULL DEFAULT 'nouveau' AFTER `message`");
        }
        if (! Schema::hasColumn('contact_messages', 'reponse_admin')) {
            DB::statement('ALTER TABLE `contact_messages` ADD COLUMN `reponse_admin` text NULL AFTER `statut`');
        }
        if (! Schema::hasColumn('contact_messages', 'date_reponse')) {
            DB::statement('ALTER TABLE `contact_messages` ADD COLUMN `date_reponse` timestamp NULL AFTER `reponse_admin`');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('contact_messages')) {
            return;
        }
        foreach (['date_reponse', 'reponse_admin', 'statut'] as $col) {
            if (Schema::hasColumn('contact_messages', $col)) {
                DB::statement("ALTER TABLE `contact_messages` DROP COLUMN `{$col}`");
            }
        }
    }
};
