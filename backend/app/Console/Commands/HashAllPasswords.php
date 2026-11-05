<?php

namespace App\Console\Commands;

use App\Models\Utilisateur;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class HashAllPasswords extends Command
{
    protected $signature = 'injob:hash-passwords';

    protected $description = 'Hash tous les mots de passe en clair (format bcrypt comme admin@injob.ma)';

    public function handle(): int
    {
        $count = 0;

        Utilisateur::query()->each(function (Utilisateur $user) use (&$count) {
            $stored = $user->getRawOriginal('mot_de_passe');

            if ($this->isBcrypt($stored)) {
                return;
            }

            $user->forceFill(['mot_de_passe' => $stored])->save();
            $count++;
            $this->line("Hashé : {$user->email}");
        });

        $this->info("Terminé. {$count} mot(s) de passe converti(s) en bcrypt.");

        return self::SUCCESS;
    }

    private function isBcrypt(?string $value): bool
    {
        return is_string($value) && str_starts_with($value, '$2y$');
    }
}
