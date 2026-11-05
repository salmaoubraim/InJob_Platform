<?php

use App\Models\Categorie;
use App\Models\Metier;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Support\OffreImages;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $devWeb = Categorie::query()->where('nom_categorie', 'Développement Web')->first();
        $marketing = Categorie::query()->where('nom_categorie', 'Marketing Digital')->first();

        if (! $devWeb || ! $marketing) {
            return;
        }

        $metiers = [
            'Développeur Full Stack' => $devWeb->id_categorie,
            'Développeur Frontend' => $devWeb->id_categorie,
            'Chargé Marketing Digital' => $marketing->id_categorie,
        ];

        $metierIds = [];
        foreach ($metiers as $nom => $idCategorie) {
            $metierIds[$nom] = Metier::firstOrCreate(
                [
                    'id_categorie' => $idCategorie,
                    'nom_metier' => $nom,
                ],
                ['description' => "Métier {$nom}"]
            )->id_metier;
        }

        $techSolutions = Recruteur::query()
            ->where('nom_entreprise', 'Tech Solutions')
            ->first();

        if (! $techSolutions) {
            return;
        }

        $updates = [
            'Développeur Full Stack' => [
                'titre' => 'Développeur Full Stack',
                'id_categorie' => $devWeb->id_categorie,
                'id_metier' => $metierIds['Développeur Full Stack'],
                'image_offre' => OffreImages::DEV_FULLSTACK,
            ],
            'Développeur PHP Laravel' => [
                'titre' => 'Développeur Frontend React',
                'id_categorie' => $devWeb->id_categorie,
                'id_metier' => $metierIds['Développeur Frontend'],
                'image_offre' => OffreImages::DEV_FRONTEND,
            ],
            'Développeur Frontend React' => [
                'titre' => 'Développeur Frontend React',
                'id_categorie' => $devWeb->id_categorie,
                'id_metier' => $metierIds['Développeur Frontend'],
                'image_offre' => OffreImages::DEV_FRONTEND,
            ],
            'Chargé Marketing Digital' => [
                'titre' => 'Chargé Marketing Digital',
                'id_categorie' => $marketing->id_categorie,
                'id_metier' => $metierIds['Chargé Marketing Digital'],
                'image_offre' => OffreImages::MARKETING_DIGITAL,
            ],
        ];

        foreach ($updates as $lookupTitre => $data) {
            OffreEmploi::query()
                ->where('id_recruteur', $techSolutions->id_recruteur)
                ->where('titre', $lookupTitre)
                ->update($data);
        }
    }

    public function down(): void
    {
        // Données de démo — pas de retour arrière.
    }
};
