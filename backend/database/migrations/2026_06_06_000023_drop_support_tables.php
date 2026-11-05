<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('support_messages')) {
            DB::statement('DROP TABLE `support_messages`');
        }
        if (Schema::hasTable('support_tickets')) {
            DB::statement('DROP TABLE `support_tickets`');
        }
    }

    public function down(): void
    {
        // Tables recréées par 2026_06_06_000019 si besoin de rollback manuel.
    }
};
