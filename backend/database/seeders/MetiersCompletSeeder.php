<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Metier;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Support\OffreImages;
use Illuminate\Database\Seeder;

class MetiersCompletSeeder extends Seeder
{
    public function run(): void
    {
        $metiers = [
            [
                'categorie' => ['nom' => 'Peinture & décoration', 'desc' => 'Bâtiment, finitions et rénovation'],
                'recruteur' => [
                    'email' => 'recruteur.peinture@injob.ma',
                    'prenom' => 'Karim',
                    'nom' => 'Benali',
                    'entreprise' => 'Déco Maroc SARL',
                    'ville' => 'Casablanca',
                    'desc_entreprise' => 'Entreprise de peinture et décoration intérieure / extérieure au Maroc.',
                ],
                'offre' => [
                    'titre' => 'Peintre en bâtiment',
                    'metier' => 'Peintre en bâtiment',
                    'description' => 'Application peinture intérieure/extérieure, préparation des supports, finitions. Expérience chantier exigée.',
                    'ville' => 'Casablanca',
                    'type_contrat' => 'CDI',
                    'salaire' => 6500,
                    'nombre_postes' => 3,
                    'mois_expiration' => 2,
                    'image_offre' => OffreImages::PEINTURE,
                ],
            ],
            [
                'categorie' => ['nom' => 'Coiffure & esthétique', 'desc' => 'Salons et soins beauté'],
                'recruteur' => [
                    'email' => 'recruteur.coiffure@injob.ma',
                    'prenom' => 'Sanae',
                    'nom' => 'Alaoui',
                    'entreprise' => 'Salon Élégance Rabat',
                    'ville' => 'Rabat',
                    'desc_entreprise' => 'Salon de coiffure mixte, coupe, coloration et soins capillaires.',
                ],
                'offre' => [
                    'titre' => 'Coiffeur / Coiffeuse',
                    'metier' => 'Coiffeur / Coiffeuse',
                    'description' => 'Coupe, brushing, coloration et conseil clientèle. Port du matériel professionnel.',
                    'ville' => 'Rabat',
                    'type_contrat' => 'CDD',
                    'salaire' => 4500,
                    'nombre_postes' => 2,
                    'mois_expiration' => 1,
                    'image_offre' => OffreImages::COIFFURE,
                ],
            ],
            [
                'categorie' => ['nom' => 'Ménage & services', 'desc' => 'Entretien à domicile et en entreprise'],
                'recruteur' => [
                    'email' => 'recruteur.menage@injob.ma',
                    'prenom' => 'Fatima',
                    'nom' => 'Zahraoui',
                    'entreprise' => 'CleanPro Services',
                    'ville' => 'Agadir',
                    'desc_entreprise' => 'Prestations de ménage régulier pour particuliers et bureaux.',
                ],
                'offre' => [
                    'titre' => 'Agent de ménage',
                    'metier' => 'Agent de ménage',
                    'description' => 'Entretien des locaux, respect des protocoles d\'hygiène, horaires flexibles.',
                    'ville' => 'Agadir',
                    'type_contrat' => 'CDI',
                    'salaire' => 3800,
                    'nombre_postes' => 5,
                    'mois_expiration' => 3,
                    'image_offre' => OffreImages::MENAGE,
                ],
            ],
            [
                'categorie' => ['nom' => 'Commerce & vente', 'desc' => 'Retail et assistance client'],
                'recruteur' => [
                    'email' => 'recruteur.boutique@injob.ma',
                    'prenom' => 'Youssef',
                    'nom' => 'Tazi',
                    'entreprise' => 'Boutique Atlas Marrakech',
                    'ville' => 'Marrakech',
                    'desc_entreprise' => 'Boutique de prêt-à-porter et accessoires au centre-ville.',
                ],
                'offre' => [
                    'titre' => 'Assistant de boutique',
                    'metier' => 'Assistant de boutique',
                    'description' => 'Accueil client, mise en rayon, encaissement et fidélisation. Bonne présentation.',
                    'ville' => 'Marrakech',
                    'type_contrat' => 'CDI',
                    'salaire' => 4200,
                    'nombre_postes' => 2,
                    'mois_expiration' => 2,
                    'image_offre' => OffreImages::BOUTIQUE,
                ],
            ],
            [
                'categorie' => ['nom' => 'Santé', 'desc' => 'Établissements de soins'],
                'recruteur' => [
                    'email' => 'recruteur.sante@injob.ma',
                    'prenom' => 'Sara',
                    'nom' => 'Benali',
                    'entreprise' => 'Clinique Santé Plus Fès',
                    'ville' => 'Fès',
                    'desc_entreprise' => 'Clinique pluridisciplinaire — soins infirmiers et accueil patients.',
                ],
                'offre' => [
                    'titre' => 'Infirmier(ère) polyvalent(e)',
                    'metier' => 'Infirmier Polyvalent',
                    'description' => 'Soins infirmiers, surveillance des patients, collaboration médicale. Diplôme d\'État requis.',
                    'ville' => 'Fès',
                    'type_contrat' => 'CDI',
                    'salaire' => 8500,
                    'nombre_postes' => 2,
                    'mois_expiration' => 4,
                    'image_offre' => OffreImages::INFIRMIERE,
                ],
            ],
            [
                'categorie' => ['nom' => 'Juridique', 'desc' => 'Cabinets et assistance juridique'],
                'recruteur' => [
                    'email' => 'recruteur.juridique@injob.ma',
                    'prenom' => 'Nadia',
                    'nom' => 'Berrada',
                    'entreprise' => 'Cabinet Juridica Tanger',
                    'ville' => 'Tanger',
                    'desc_entreprise' => 'Cabinet d\'avocats — droit des affaires et droit social.',
                ],
                'offre' => [
                    'titre' => 'Assistant(e) avocat',
                    'metier' => 'Assistant(e) avocat',
                    'description' => 'Rédaction d\'actes, classement dossiers, accueil clients, veille juridique. Bac+3 droit minimum.',
                    'ville' => 'Tanger',
                    'type_contrat' => 'CDI',
                    'salaire' => 7000,
                    'nombre_postes' => 1,
                    'mois_expiration' => 2,
                    'image_offre' => OffreImages::AVOCAT,
                ],
            ],
        ];

        foreach ($metiers as $item) {
            $cat = Categorie::firstOrCreate(
                ['nom_categorie' => $item['categorie']['nom']],
                ['description' => $item['categorie']['desc']]
            );

            $r = $item['recruteur'];
            $utilisateur = Utilisateur::firstOrCreate(
                ['email' => $r['email']],
                [
                    'nom' => $r['nom'],
                    'prenom' => $r['prenom'],
                    'mot_de_passe' => 'Recruteur@2024',
                    'telephone' => '+212600000001',
                    'role' => 'recruteur',
                ]
            );

            $recruteur = Recruteur::firstOrCreate(
                ['id_user' => $utilisateur->id_user],
                [
                    'id_categorie' => $cat->id_categorie,
                    'nom_entreprise' => $r['entreprise'],
                    'description_entreprise' => $r['desc_entreprise'],
                    'ville' => $r['ville'],
                ]
            );

            if ((int) $recruteur->id_categorie !== (int) $cat->id_categorie) {
                $recruteur->update(['id_categorie' => $cat->id_categorie]);
            }

            $o = $item['offre'];
            $metier = Metier::firstOrCreate(
                [
                    'id_categorie' => $cat->id_categorie,
                    'nom_metier' => $o['metier'] ?? $o['titre'],
                ],
                ['description' => $o['description']]
            );

            OffreEmploi::updateOrCreate(
                [
                    'id_recruteur' => $recruteur->id_recruteur,
                    'titre' => $o['titre'],
                ],
                [
                    'id_categorie' => $cat->id_categorie,
                    'id_metier' => $metier->id_metier,
                    'description' => $o['description'],
                    'ville' => $o['ville'],
                    'type_contrat' => $o['type_contrat'],
                    'salaire' => $o['salaire'],
                    'nombre_postes' => $o['nombre_postes'],
                    'date_publication' => now()->toDateString(),
                    'date_expiration' => now()->addMonths($o['mois_expiration'])->toDateString(),
                    'statut' => 'active',
                    'est_publie' => true,
                    'image_offre' => $o['image_offre'] ?? null,
                ]
            );
        }
    }
}
