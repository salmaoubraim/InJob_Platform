<?php

namespace App\Support;

use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;

class RecruteurDomainSync
{
    public static function ensureDomain(Recruteur $recruteur): Recruteur
    {
        if ($recruteur->id_categorie) {
            return $recruteur->loadMissing('categorie');
        }

        $domain = OffreEmploi::query()
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->whereNotNull('id_categorie')
            ->orderByDesc('date_publication')
            ->value('id_categorie');

        if ($domain) {
            $recruteur->update(['id_categorie' => $domain]);
        }

        return $recruteur->fresh(['categorie']);
    }

    public static function syncForUser(Utilisateur $user): Utilisateur
    {
        if ($user->role !== 'recruteur' || ! $user->recruteur) {
            return $user;
        }

        self::ensureDomain($user->recruteur);

        return $user->load(['recruteur.categorie']);
    }
}
