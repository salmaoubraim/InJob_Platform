<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('candidatures')) {
            DB::statement('ALTER TABLE candidatures MODIFY statut VARCHAR(32) NOT NULL DEFAULT \'en_attente\'');

            DB::table('candidatures')->whereIn('statut', ['En attente', 'en attente'])->update(['statut' => 'en_attente']);
            DB::table('candidatures')->whereIn('statut', ['Acceptee', 'Acceptée', 'acceptée'])->update(['statut' => 'acceptee']);
            DB::table('candidatures')->whereIn('statut', ['Refusee', 'Refusée', 'refusée'])->update(['statut' => 'refusee']);
            DB::table('candidatures')->whereIn('statut', ['Entretien programme', 'entretien programme'])->update(['statut' => 'entretien_programme']);

            DB::statement("ALTER TABLE candidatures MODIFY statut ENUM('en_attente','acceptee','refusee','entretien_programme') NOT NULL DEFAULT 'en_attente'");
        }

        if (Schema::hasTable('candidatures') && ! Schema::hasColumn('candidatures', 'date_entretien')) {
            Schema::table('candidatures', function ($table) {
                $table->dateTime('date_entretien')->nullable()->after('date_candidature');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('candidatures', 'date_entretien')) {
            Schema::table('candidatures', function ($table) {
                $table->dropColumn('date_entretien');
            });
        }

        DB::statement("ALTER TABLE candidatures MODIFY statut ENUM('en_attente','acceptee','refusee') NOT NULL DEFAULT 'en_attente'");
    }
};
