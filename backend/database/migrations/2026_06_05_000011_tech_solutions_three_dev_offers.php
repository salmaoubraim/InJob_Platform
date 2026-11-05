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
        $techSolutions = Recruteur::query()->where('nom_entreprise', 'Tech Solutions')->first();

        if (! $devWeb || ! $techSolutions) {
            return;
        }

        OffreEmploi::query()
            ->where('id_recruteur', $techSolutions->id_recruteur)
            ->where('titre', 'Chargé Marketing Digital')
            ->delete();

        $metiers = [
            'Développeur Full Stack' => 'React, Laravel, architecture complète.',
            'Développeur Frontend React' => 'Interfaces React, TypeScript et intégration API.',
            'Développeur PHP Laravel' => 'API REST, Laravel et MySQL.',
        ];

        $metierIds = [];
        foreach ($metiers as $nom => $desc) {
            $metierIds[$nom] = Metier::firstOrCreate(
                [
                    'id_categorie' => $devWeb->id_categorie,
                    'nom_metier' => $nom,
                ],
                ['description' => $desc]
            )->id_metier;
        }

        $offres = [
            [
                'titre' => 'Développeur Full Stack',
                'description' => 'React, Laravel et MySQL. Équipe agile, télétravail partiel.',
                'id_metier' => $metierIds['Développeur Full Stack'],
                'type_contrat' => 'CDI',
                'salaire' => 15000,
                'nombre_postes' => 2,
                'image_offre' => OffreImages::DEV_FULLSTACK,
            ],
            [
                'titre' => 'Développeur Frontend React',
                'description' => 'Création d\'interfaces modernes avec React et Tailwind CSS.',
                'id_metier' => $metierIds['Développeur Frontend React'],
                'type_contrat' => 'CDI',
                'salaire' => 12000,
                'nombre_postes' => 1,
                'image_offre' => OffreImages::DEV_FRONTEND,
            ],
            [
                'titre' => 'Développeur PHP Laravel',
                'description' => 'Développement d\'API et back-office avec Laravel et MySQL.',
                'id_metier' => $metierIds['Développeur PHP Laravel'],
                'type_contrat' => 'CDD',
                'salaire' => 9000,
                'nombre_postes' => 1,
                'image_offre' => OffreImages::DEV_PHP,
            ],
        ];

        foreach ($offres as $data) {
            OffreEmploi::updateOrCreate(
                [
                    'id_recruteur' => $techSolutions->id_recruteur,
                    'titre' => $data['titre'],
                ],
                [
                    'id_categorie' => $devWeb->id_categorie,
                    'id_metier' => $data['id_metier'],
                    'description' => $data['description'],
                    'ville' => 'Casablanca',
                    'type_contrat' => $data['type_contrat'],
                    'salaire' => $data['salaire'],
                    'nombre_postes' => $data['nombre_postes'],
                    'date_publication' => now()->toDateString(),
                    'date_expiration' => now()->addMonths(2)->toDateString(),
                    'statut' => 'active',
                    'est_publie' => true,
                    'image_offre' => $data['image_offre'],
                ]
            );
        }
    }

    public function down(): void
    {
        // Données de démo — pas de retour arrière.
    }
};
