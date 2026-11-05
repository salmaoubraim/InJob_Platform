<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offres_emploi', function (Blueprint $table) {
            $table->boolean('est_publie')->default(false)->after('statut');
        });

        DB::table('offres_emploi')->update(['est_publie' => false]);
    }

    public function down(): void
    {
        Schema::table('offres_emploi', function (Blueprint $table) {
            $table->dropColumn('est_publie');
        });
    }
};
