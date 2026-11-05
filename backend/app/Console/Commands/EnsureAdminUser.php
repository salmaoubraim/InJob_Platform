<?php

namespace App\Console\Commands;

use App\Models\Administrateur;
use App\Models\Utilisateur;
use Illuminate\Console\Command;

class EnsureAdminUser extends Command
{
    protected $signature = 'injob:ensure-admin';

    protected $description = 'Crée ou réinitialise admin@injob.ma (mot de passe Admin@2024)';

    public function handle(): int
    {
        $user = Utilisateur::where('email', 'admin@injob.ma')->first();

        if ($user) {
            $user->forceFill(['mot_de_passe' => 'Admin@2024'])->save();
            $this->info('Mot de passe admin réinitialisé.');
        } else {
            $user = Utilisateur::create([
                'nom' => 'Admin',
                'prenom' => 'InJob',
                'email' => 'admin@injob.ma',
                'mot_de_passe' => 'Admin@2024',
                'telephone' => '+212600000000',
                'role' => 'admin',
            ]);
            Administrateur::create(['id_user' => $user->id_user]);
            $this->info('Compte admin créé.');
        }

        $this->line('Email    : admin@injob.ma');
        $this->line('Password : Admin@2024');

        return self::SUCCESS;
    }
}
