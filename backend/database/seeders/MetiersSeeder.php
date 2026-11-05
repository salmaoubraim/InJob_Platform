<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Metier;
use Illuminate\Database\Seeder;

class MetiersSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            'Informatique & tech' => [
                ['nom' => 'Développeur Full Stack', 'desc' => 'Développement web front-end et back-end'],
                ['nom' => 'Designer UI/UX', 'desc' => 'Conception d\'interfaces et expérience utilisateur'],
                ['nom' => 'Responsable Marketing Digital', 'desc' => 'Stratégie digitale et campagnes en ligne'],
            ],
            'Finance' => [
                ['nom' => 'Comptable', 'desc' => 'Tenue comptable et déclarations fiscales'],
            ],
            'Peinture & décoration' => [
                ['nom' => 'Peintre en bâtiment', 'desc' => 'Peinture intérieure et extérieure'],
            ],
            'Coiffure & esthétique' => [
                ['nom' => 'Coiffeur / Coiffeuse', 'desc' => 'Coupe, coloration et soins capillaires'],
            ],
            'Ménage & services' => [
                ['nom' => 'Agent de ménage', 'desc' => 'Entretien des locaux et hygiène'],
            ],
            'Commerce & vente' => [
                ['nom' => 'Commercial Terrain', 'desc' => 'Prospection et vente sur le terrain'],
                ['nom' => 'Assistant de boutique', 'desc' => 'Accueil client et vente en magasin'],
            ],
            'Santé' => [
                ['nom' => 'Infirmier Polyvalent', 'desc' => 'Soins infirmiers en établissement de santé'],
                ['nom' => 'Médecin Généraliste', 'desc' => 'Consultations et suivi des patients'],
            ],
            'Juridique' => [
                ['nom' => 'Assistant(e) avocat', 'desc' => 'Assistance juridique et rédaction d\'actes'],
            ],
            'Marketing' => [
                ['nom' => 'Chargé de communication', 'desc' => 'Communication et notoriété de marque'],
            ],
        ];

        foreach ($catalog as $catName => $metiers) {
            $cat = Categorie::firstOrCreate(
                ['nom_categorie' => $catName],
                ['description' => "Domaine {$catName}"]
            );

            foreach ($metiers as $m) {
                Metier::firstOrCreate(
                    [
                        'id_categorie' => $cat->id_categorie,
                        'nom_metier' => $m['nom'],
                    ],
                    ['description' => $m['desc']]
                );
            }
        }
    }
}
