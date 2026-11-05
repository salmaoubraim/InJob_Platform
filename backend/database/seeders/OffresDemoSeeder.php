<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Metier;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Support\OffreImages;
use Illuminate\Database\Seeder;

/**
 * 4 offres fixes affichées sur l'accueil (catalogue / exemples).
 * Crée ses propres recruteurs — ne dépend pas de MetiersCompletSeeder.
 */
class OffresDemoSeeder extends Seeder
{
    public function run(): void
    {
        $profils = [
            [
                'email' => 'recruteur.dev@injob.ma',
                'prenom' => 'Sara',
                'nom' => 'Benali',
                'entreprise' => 'Tech Solutions Maroc',
                'ville' => 'Casablanca',
                'categorie' => 'Informatique & tech',
                'metier' => 'Développeur Full Stack',
                'offre' => [
                    'titre' => 'Développeur Full Stack',
                    'description' => 'React, Laravel et MySQL. Équipe agile, télétravail partiel.',
                    'ville' => 'Casablanca',
                    'type_contrat' => 'CDI',
                    'salaire' => 15000,
                    'nombre_postes' => 2,
                    'date_expiration' => now()->addMonths(2)->toDateString(),
                    'image_offre' => OffreImages::DEV,
                ],
            ],
            [
                'email' => 'recruteur.marketing@injob.ma',
                'prenom' => 'Salma',
                'nom' => 'Idrissi',
                'entreprise' => 'Agence Digital Rabat',
                'ville' => 'Rabat',
                'categorie' => 'Marketing',
                'metier' => 'Chargé de communication',
                'offre' => [
                    'titre' => 'Responsable Marketing Digital',
                    'description' => 'SEO, réseaux sociaux et campagnes pour le marché marocain.',
                    'ville' => 'Rabat',
                    'type_contrat' => 'CDI',
                    'salaire' => 12000,
                    'nombre_postes' => 1,
                    'date_expiration' => now()->addMonths(1)->addDays(15)->toDateString(),
                    'image_offre' => OffreImages::MARKETING,
                ],
            ],
            [
                'email' => 'recruteur.compta@injob.ma',
                'prenom' => 'Karim',
                'nom' => 'Bennis',
                'entreprise' => 'Cabinet Compta Plus',
                'ville' => 'Agadir',
                'categorie' => 'Finance',
                'metier' => 'Comptable',
                'offre' => [
                    'titre' => 'Comptable',
                    'description' => 'Gestion comptable, déclarations fiscales, maîtrise de Sage.',
                    'ville' => 'Agadir',
                    'type_contrat' => 'CDD',
                    'salaire' => 9500,
                    'nombre_postes' => 1,
                    'date_expiration' => now()->addDays(45)->toDateString(),
                    'image_offre' => OffreImages::COMPTABLE,
                ],
            ],
            [
                'email' => 'recruteur.design@injob.ma',
                'prenom' => 'Lina',
                'nom' => 'Tahiri',
                'entreprise' => 'Studio Créatif Marrakech',
                'ville' => 'Marrakech',
                'categorie' => 'Informatique & tech',
                'metier' => 'Designer UI/UX',
                'offre' => [
                    'titre' => 'Designer UI/UX',
                    'description' => 'Maquettes Figma, design system et collaboration avec les devs.',
                    'ville' => 'Marrakech',
                    'type_contrat' => 'Freelance',
                    'salaire' => null,
                    'nombre_postes' => 3,
                    'date_expiration' => now()->addMonths(3)->toDateString(),
                    'image_offre' => OffreImages::DESIGN,
                ],
            ],
        ];

        foreach ($profils as $profil) {
            $cat = Categorie::firstOrCreate(
                ['nom_categorie' => $profil['categorie']],
                ['description' => "Domaine {$profil['categorie']}"]
            );

            $metier = Metier::firstOrCreate(
                [
                    'id_categorie' => $cat->id_categorie,
                    'nom_metier' => $profil['metier'],
                ],
                ['description' => $profil['offre']['description']]
            );

            $utilisateur = Utilisateur::firstOrCreate(
                ['email' => $profil['email']],
                [
                    'nom' => $profil['nom'],
                    'prenom' => $profil['prenom'],
                    'mot_de_passe' => 'Recruteur@2024',
                    'telephone' => '+212600000010',
                    'role' => 'recruteur',
                ]
            );

            $recruteur = Recruteur::firstOrCreate(
                ['id_user' => $utilisateur->id_user],
                [
                    'id_categorie' => $cat->id_categorie,
                    'nom_entreprise' => $profil['entreprise'],
                    'description_entreprise' => "Recruteur démo — {$profil['entreprise']}",
                    'ville' => $profil['ville'],
                ]
            );

            if ((int) $recruteur->id_categorie !== (int) $cat->id_categorie) {
                $recruteur->update(['id_categorie' => $cat->id_categorie]);
            }

            $data = $profil['offre'];
            OffreEmploi::updateOrCreate(
                [
                    'id_recruteur' => $recruteur->id_recruteur,
                    'titre' => $data['titre'],
                ],
                [
                    'id_categorie' => $cat->id_categorie,
                    'id_metier' => $metier->id_metier,
                    'description' => $data['description'],
                    'ville' => $data['ville'],
                    'type_contrat' => $data['type_contrat'],
                    'salaire' => $data['salaire'],
                    'date_publication' => now()->toDateString(),
                    'date_expiration' => $data['date_expiration'],
                    'nombre_postes' => $data['nombre_postes'],
                    'statut' => 'active',
                    'image_offre' => $data['image_offre'] ?? null,
                    'est_publie' => true,
                ]
            );
        }
    }
}
