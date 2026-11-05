<?php

use App\Models\Categorie;
use App\Models\Metier;
use App\Models\OffreEmploi;
use App\Support\OffreImages;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        OffreEmploi::query()
            ->whereIn('titre', ['Développeur PHP Laravel', 'Développeur Frontend React'])
            ->delete();

        $marketing = Categorie::query()->firstOrCreate(
            ['nom_categorie' => 'Marketing'],
            ['description' => 'Communication, marketing et stratégie digitale']
        );

        $metierMarketing = Metier::query()->firstOrCreate(
            [
                'id_categorie' => $marketing->id_categorie,
                'nom_metier' => 'Chargé Marketing Digital',
            ],
            ['description' => 'Campagnes digitales et réseaux sociaux']
        );

        OffreEmploi::query()
            ->where('titre', 'Chargé Marketing Digital')
            ->update([
                'id_categorie' => $marketing->id_categorie,
                'id_metier' => $metierMarketing->id_metier,
                'image_offre' => OffreImages::MARKETING_DIGITAL,
            ]);

        OffreEmploi::query()
            ->where('titre', 'Développeur Full Stack')
            ->update([
                'image_offre' => OffreImages::DEV_FULLSTACK,
            ]);
    }

    public function down(): void
    {
        // Données de démo — pas de retour arrière.
    }
};
