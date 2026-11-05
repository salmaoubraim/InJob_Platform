<?php

namespace Database\Seeders;

use App\Models\Candidat;
use App\Models\CV;
use App\Models\Utilisateur;
use App\Support\DemoCvPdfWriter;
use Illuminate\Database\Seeder;

/**
 * CV PDF d'exemple pour les candidats InJob.
 *
 * Usage :
 *   php artisan db:seed --class=CvDemoSeeder
 */
class CvDemoSeeder extends Seeder
{
    /** @var array<int, array{prenom: string, nom: string, email?: string, ville: string, metier: string, competences: string}> */
    private array $profiles = [
        [
            'prenom' => 'Omar',
            'nom' => 'Amrani',
            'email' => 'omar.amrani@injob.ma',
            'ville' => 'Casablanca',
            'metier' => 'Développeur Full Stack',
            'competences' => 'React, Laravel, JavaScript, PHP, MySQL, API REST',
        ],
        [
            'prenom' => 'Sara',
            'nom' => 'Amrani',
            'email' => 'sara.amrani@injob.ma',
            'ville' => 'Rabat',
            'metier' => 'Coiffeuse',
            'competences' => 'Coupe, coloration, soins capillaires',
        ],
        [
            'prenom' => 'Yassine',
            'nom' => 'Ouardi',
            'email' => 'yassine.ouardi@injob.ma',
            'ville' => 'Agadir',
            'metier' => 'Developpeur Full Stack',
            'competences' => 'PHP, Laravel, React, MySQL',
        ],
        [
            'prenom' => 'Leila',
            'nom' => 'Mansouri',
            'email' => 'leila.mansouri@injob.ma',
            'ville' => 'Marrakech',
            'metier' => 'Commerciale terrain',
            'competences' => 'Prospection, negociation, relation client',
        ],
        [
            'prenom' => 'Yassine',
            'nom' => 'Alaoui',
            'email' => 'yassine@gmail.com',
            'ville' => 'Casablanca',
            'metier' => 'Developpeur PHP Laravel',
            'competences' => 'PHP, Laravel, API REST, MySQL',
        ],
    ];

    public function run(): void
    {
        foreach ($this->profiles as $profile) {
            $candidat = $this->resolveCandidat($profile);
            if (! $candidat) {
                $this->command?->warn("Candidat introuvable : {$profile['email']}");

                continue;
            }

            $this->seedCvForCandidat($candidat, $profile);
            $this->command?->info("CV PDF : {$profile['prenom']} {$profile['nom']}");
        }
    }

    private function resolveCandidat(array $profile): ?Candidat
    {
        if (! empty($profile['email'])) {
            $user = Utilisateur::where('email', $profile['email'])->where('role', 'candidat')->first();
            if ($user) {
                return Candidat::where('id_user', $user->id_user)->first();
            }
        }

        return Candidat::whereHas('utilisateur', function ($q) use ($profile) {
            $q->where('prenom', $profile['prenom'])->where('nom', $profile['nom']);
        })->first();
    }

    private function seedCvForCandidat(Candidat $candidat, array $profile): void
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
            "Metier : {$profile['metier']}",
            "Competences : {$profile['competences']}",
            'Experience : 2 a 5 ans',
            'Email : '.($profile['email'] ?? 'contact@injob.ma'),
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
}
