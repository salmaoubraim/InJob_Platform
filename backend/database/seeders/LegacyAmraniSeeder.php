<?php

namespace Database\Seeders;

use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\Categorie;
use App\Models\CV;
use App\Models\Message;
use App\Models\OffreEmploi;
use App\Models\Utilisateur;
use App\Support\CandidatCompetenceSync;
use App\Support\DemoCvPdfWriter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

/**
 * Restaure Omar Amrani et Sara Amrani (candidats historiques InJob)
 * avec profils, CV, candidatures et messages de démo.
 */
class LegacyAmraniSeeder extends Seeder
{
    /** @var list<array<string, mixed>> */
    private array $profiles = [
        [
            'email' => 'omar.amrani@injob.ma',
            'legacy_emails' => ['omar.alami@injob.ma'],
            'prenom' => 'Omar',
            'nom' => 'Amrani',
            'telephone' => '+212612345678',
            'ville' => 'Casablanca',
            'domaine' => 'Informatique & tech',
            'competences' => 'React, Laravel, JavaScript, PHP, MySQL, Node.js',
            'experience' => '2 à 5 ans',
            'cv_metier' => 'Développeur Full Stack',
            'cv_competences' => 'React, Laravel, JavaScript, PHP, MySQL, API REST',
            'candidatures' => [
                ['titre' => 'Peintre', 'statut' => 'en_attente'],
                ['titre' => 'Full Stack', 'statut' => 'acceptee'],
            ],
        ],
        [
            'email' => 'sara.amrani@injob.ma',
            'legacy_emails' => ['sara.bennani@injob.ma'],
            'prenom' => 'Sara',
            'nom' => 'Amrani',
            'telephone' => '+212698765432',
            'ville' => 'Rabat',
            'domaine' => 'Coiffure & esthétique',
            'competences' => 'Coupe, coloration, soins capillaires, conseil clientèle',
            'experience' => '2 à 5 ans',
            'cv_metier' => 'Coiffeuse',
            'cv_competences' => 'Coupe, coloration, soins capillaires',
            'candidatures' => [
                ['titre' => 'Coiffeur', 'statut' => 'entretien_programme'],
                ['titre' => 'Peintre', 'statut' => 'en_attente'],
            ],
        ],
    ];

    public function run(): void
    {
        foreach ($this->profiles as $profile) {
            $user = $this->restoreUser($profile);
            $candidat = $this->restoreCandidat($user, $profile);
            $this->restoreCv($candidat, $profile);
            $this->restoreCandidatures($candidat, $profile);
            CandidatCompetenceSync::applyTo($candidat);
            $this->command?->info("Restauré : {$profile['prenom']} {$profile['nom']} ({$profile['email']})");
        }

        $this->restoreMessages();
    }

    /** @param array<string, mixed> $profile */
    private function restoreUser(array $profile): Utilisateur
    {
        $existing = Utilisateur::where('email', $profile['email'])->first();

        if (! $existing) {
            foreach ($profile['legacy_emails'] as $legacyEmail) {
                $legacy = Utilisateur::where('email', $legacyEmail)->first();
                if ($legacy) {
                    $existing = $legacy;
                    break;
                }
            }
        }

        if ($existing) {
            $existing->update([
                'prenom' => $profile['prenom'],
                'nom' => $profile['nom'],
                'email' => $profile['email'],
                'telephone' => $profile['telephone'],
                'role' => 'candidat',
                'est_actif' => true,
            ]);

            return $existing->fresh();
        }

        return Utilisateur::create([
            'prenom' => $profile['prenom'],
            'nom' => $profile['nom'],
            'email' => $profile['email'],
            'mot_de_passe' => 'Candidat@2024',
            'telephone' => $profile['telephone'],
            'role' => 'candidat',
            'est_actif' => true,
        ]);
    }

    /** @param array<string, mixed> $profile */
    private function restoreCandidat(Utilisateur $user, array $profile): Candidat
    {
        $cat = Categorie::where('nom_categorie', $profile['domaine'])->first();

        $candidat = Candidat::firstOrCreate(
            ['id_user' => $user->id_user],
            [
                'id_categorie' => $cat?->id_categorie,
                'ville' => $profile['ville'],
                'adresse' => $profile['ville'].', Maroc',
                'competences' => $profile['competences'],
                'experience' => $profile['experience'],
            ]
        );

        $candidat->update([
            'id_categorie' => $cat?->id_categorie,
            'ville' => $profile['ville'],
            'adresse' => $profile['ville'].', Maroc',
            'competences' => $profile['competences'],
            'experience' => $profile['experience'],
        ]);

        return $candidat->fresh();
    }

    /** @param array<string, mixed> $profile */
    private function restoreCv(Candidat $candidat, array $profile): void
    {
        $slug = strtolower($profile['prenom'].'_'.$profile['nom']);
        $slug = preg_replace('/[^a-z0-9_]/', '', str_replace(' ', '_', $slug));
        $diskName = "cv_exemple_{$slug}.pdf";
        $displayName = "CV_{$profile['prenom']}_{$profile['nom']}_InJob.pdf";
        $webPath = '/cvs/'.$diskName;
        $fullPath = public_path('cvs/'.$diskName);

        $lines = [
            "Nom : {$profile['prenom']} {$profile['nom']}",
            "Ville : {$profile['ville']}, Maroc",
            "Metier : {$profile['cv_metier']}",
            "Competences : {$profile['cv_competences']}",
            'Experience : '.$profile['experience'],
            "Email : {$profile['email']}",
            'Disponibilite : Immediate',
            '',
            '--- Modele InJob ---',
            'Remplacez ce fichier par votre propre CV PDF',
            'via Mon CV ou en copiant un PDF dans public/cvs/',
        ];

        DemoCvPdfWriter::write(
            $fullPath,
            "CV — {$profile['prenom']} {$profile['nom']}",
            $lines
        );

        CV::where('id_candidat', $candidat->id_candidat)->delete();

        CV::create([
            'id_candidat' => $candidat->id_candidat,
            'nom_fichier' => $displayName,
            'chemin_fichier' => $webPath,
        ]);
    }

    /** @param array<string, mixed> $profile */
    private function restoreCandidatures(Candidat $candidat, array $profile): void
    {
        foreach ($profile['candidatures'] as $item) {
            $offre = OffreEmploi::where('titre', 'like', '%'.$item['titre'].'%')->first();
            if (! $offre) {
                continue;
            }

            $attrs = [
                'statut' => $item['statut'],
                'date_candidature' => now()->subDays(5),
            ];

            if (
                Schema::hasColumn('candidatures', 'date_entretien')
                && $item['statut'] === 'entretien_programme'
            ) {
                $attrs['date_entretien'] = now()->addDays(3);
            }

            Candidature::updateOrCreate(
                [
                    'id_offre' => $offre->id_offre,
                    'id_candidat' => $candidat->id_candidat,
                ],
                $attrs
            );
        }
    }

    private function restoreMessages(): void
    {
        $pairs = [
            ['email' => 'omar.amrani@injob.ma', 'titre' => 'Peintre'],
            ['email' => 'sara.amrani@injob.ma', 'titre' => 'Coiffeur'],
        ];

        foreach ($pairs as $pair) {
            $user = Utilisateur::where('email', $pair['email'])->first();
            $offre = OffreEmploi::where('titre', 'like', '%'.$pair['titre'].'%')->first();
            $recruteurUser = $offre?->recruteur?->utilisateur;

            if (! $user || ! $recruteurUser || ! $offre) {
                continue;
            }

            Message::firstOrCreate(
                [
                    'expediteur' => $user->id_user,
                    'destinataire' => $recruteurUser->id_user,
                    'contenu' => "Bonjour, je suis intéressé(e) par l'offre « {$offre->titre} ». Disponible pour un entretien.",
                ],
                ['date_envoi' => now()->subDays(2)]
            );

            Message::firstOrCreate(
                [
                    'expediteur' => $recruteurUser->id_user,
                    'destinataire' => $user->id_user,
                    'contenu' => 'Merci pour votre candidature. Pouvez-vous confirmer votre disponibilité pour un entretien cette semaine ?',
                ],
                ['date_envoi' => now()->subDay()]
            );

            Message::firstOrCreate(
                [
                    'expediteur' => $user->id_user,
                    'destinataire' => $recruteurUser->id_user,
                    'contenu' => 'Oui, je suis disponible du lundi au jeudi. Merci pour votre retour rapide.',
                ],
                ['date_envoi' => now()->subHours(12)]
            );
        }
    }
}
