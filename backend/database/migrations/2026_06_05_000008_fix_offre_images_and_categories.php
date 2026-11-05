<?php

use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Support\OffreImages;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        OffreEmploi::query()->each(function (OffreEmploi $offre) {
            $expected = OffreImages::forTitre($offre->titre ?? '');
            $stored = $offre->image_offre;

            if (! $stored || (OffreImages::isPoolUrl($stored) && $stored !== $expected)) {
                $offre->update(['image_offre' => $expected]);
            }
        });

        $techSolutions = Recruteur::query()
            ->where('nom_entreprise', 'Tech Solutions')
            ->first();

        if ($techSolutions?->id_categorie) {
            OffreEmploi::query()
                ->where('id_recruteur', $techSolutions->id_recruteur)
                ->whereIn('titre', ['Développeur Full Stack', 'Développeur PHP Laravel'])
                ->update(['id_categorie' => $techSolutions->id_categorie]);
        }
    }

    public function down(): void
    {
        // Données de démo — pas de retour arrière.
    }
};
