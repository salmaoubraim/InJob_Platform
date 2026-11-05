<?php

namespace Database\Seeders;

use App\Models\Administrateur;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Peuplement complet InJob (ordre obligatoire) :
     *
     * 1. Administrateur
     * 2. OffresDemoSeeder     → 4 offres fixes pour l'accueil (catalogue)
     * 3. MetiersCompletSeeder → 6 offres pour l'espace candidat (photos + recruteurs)
     * 4. DemoCompletSeeder    → candidats, CV, candidatures, messages, avis
     */
    public function run(): void
    {
        $this->seedAdministrateur();

        $this->call([
            MetiersSeeder::class,
            OffresDemoSeeder::class,
            MetiersCompletSeeder::class,
            DemoCompletSeeder::class,
            CvDemoSeeder::class,
            LegacyAmraniSeeder::class,
        ]);
    }

    private function seedAdministrateur(): void
    {
        if (Utilisateur::where('email', 'admin@injob.ma')->exists()) {
            return;
        }

        $admin = Utilisateur::create([
            'nom' => 'Admin',
            'prenom' => 'InJob',
            'email' => 'admin@injob.ma',
            'mot_de_passe' => 'Admin@2024',
            'telephone' => '+212600000000',
            'role' => 'admin',
        ]);

        Administrateur::create(['id_user' => $admin->id_user]);
    }
}
