<?php

use App\Support\CandidatCompetenceSync;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        CandidatCompetenceSync::ensureTechMetiers();
        CandidatCompetenceSync::applyToAll();
    }

    public function down(): void
    {
        // Données de référence — pas de rollback destructif.
    }
};
