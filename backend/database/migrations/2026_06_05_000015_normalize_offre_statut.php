<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('offres_emploi')
            ->whereRaw('LOWER(statut) = ?', ['active'])
            ->update(['statut' => 'active']);

        DB::table('offres_emploi')
            ->whereRaw('LOWER(statut) = ?', ['inactive'])
            ->update(['statut' => 'inactive']);

        DB::table('offres_emploi')
            ->whereRaw('LOWER(statut) = ?', ['expiree'])
            ->update(['statut' => 'expiree']);
    }

    public function down(): void
    {
        // Normalisation — pas de retour arrière.
    }
};
