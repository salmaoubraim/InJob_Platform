<?php

use App\Models\OffreEmploi;
use App\Support\OffreImages;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        OffreEmploi::query()
            ->where('titre', 'like', '%Peintre%')
            ->orWhere('titre', 'like', '%peintre%')
            ->update(['image_offre' => OffreImages::PEINTURE]);
    }

    public function down(): void
    {
        // Données de démo — pas de retour arrière.
    }
};
