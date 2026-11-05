<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('offres_emploi')
            ->where(function ($q) {
                $q->where('est_publie', false)
                    ->orWhereNull('est_publie');
            })
            ->update(['est_publie' => true]);

        DB::table('offres_emploi')
            ->where(function ($q) {
                $q->whereRaw('LOWER(statut) IN (?, ?, ?)', ['active', 'actif', 'publie'])
                    ->orWhereNull('statut')
                    ->orWhere('statut', '');
            })
            ->update(['statut' => 'active']);
    }

    public function down(): void
    {
        // Données de démo — pas de retour arrière.
    }
};
