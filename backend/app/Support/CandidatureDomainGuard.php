<?php

namespace App\Support;

use App\Models\Candidat;
use App\Models\Metier;
use App\Models\OffreEmploi;
use App\Models\Recruteur;

class CandidatureDomainGuard
{
    public const ERROR_MESSAGE =
        'Cette offre ne correspond pas à votre domaine ni à vos compétences enregistrées.';

    public const RECRUTEUR_OFFER_DOMAIN_MESSAGE =
        'Vous ne pouvez publier que des offres dans le domaine de spécialité de votre entreprise.';

    public static function canApply(Candidat $candidat, OffreEmploi $offre): bool
    {
        $candidat->loadMissing(['metier', 'competencesMetiers']);
        $offre->loadMissing('metier');

        if (
            $candidat->id_categorie
            && $offre->id_categorie
            && (int) $candidat->id_categorie === (int) $offre->id_categorie
        ) {
            return true;
        }

        if (
            $candidat->id_metier
            && $offre->id_metier
            && (int) $candidat->id_metier === (int) $offre->id_metier
        ) {
            return true;
        }

        if ($offre->id_metier && $candidat->competencesMetiers->contains('id_metier', (int) $offre->id_metier)) {
            return true;
        }

        $competences = trim((string) ($candidat->competences ?? ''));
        if ($competences !== '' && self::competencesMatchOffer($competences, $offre)) {
            return true;
        }

        if (! $candidat->id_categorie || ! $offre->id_categorie) {
            return true;
        }

        return false;
    }

    private static function competencesMatchOffer(string $competences, OffreEmploi $offre): bool
    {
        $tokens = self::parseCompetences($competences);
        if ($tokens === []) {
            return false;
        }

        $offre->loadMissing('metier');

        $targets = array_filter([
            $offre->metier?->nom_metier,
            $offre->titre,
        ]);

        foreach ($tokens as $token) {
            foreach ($targets as $target) {
                if (self::textsOverlap($token, $target)) {
                    return true;
                }
            }
        }

        if ($offre->id_metier) {
            $offerMetier = Metier::find($offre->id_metier);
            if ($offerMetier) {
                foreach ($tokens as $token) {
                    if (self::textsOverlap($token, $offerMetier->nom_metier)) {
                        return true;
                    }
                }
            }
        }

        if ($offre->id_categorie) {
            foreach (Metier::where('id_categorie', $offre->id_categorie)->get() as $metier) {
                foreach ($tokens as $token) {
                    if (self::textsOverlap($token, $metier->nom_metier)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /** @return list<string> */
    private static function parseCompetences(string $competences): array
    {
        $parts = preg_split('/[,;|\/\n]+/', mb_strtolower($competences)) ?: [];

        return array_values(array_filter(array_map(
            fn (string $p) => trim($p),
            $parts
        ), fn (string $p) => mb_strlen($p) >= 2));
    }

    private static function textsOverlap(string $a, string $b): bool
    {
        $a = mb_strtolower(trim($a));
        $b = mb_strtolower(trim($b));

        if ($a === '' || $b === '') {
            return false;
        }

        if (str_contains($a, $b) || str_contains($b, $a)) {
            return true;
        }

        foreach (preg_split('/\s+/', $b) ?: [] as $word) {
            if (mb_strlen($word) >= 3 && (str_contains($a, $word) || str_contains($word, $a))) {
                return true;
            }
        }

        return false;
    }

    public static function assertCanApply(Candidat $candidat, OffreEmploi $offre): void
    {
        if (! self::canApply($candidat, $offre)) {
            abort(422, self::ERROR_MESSAGE);
        }
    }

    public static function canRecruteurPublishInCategory(Recruteur $recruteur, int $idCategorie): bool
    {
        if (! $recruteur->id_categorie) {
            return true;
        }

        return (int) $recruteur->id_categorie === $idCategorie;
    }

    public static function belongsToRecruteurDomain(Recruteur $recruteur, OffreEmploi $offre): bool
    {
        if (! $recruteur->id_categorie || ! $offre->id_categorie) {
            return true;
        }

        return (int) $recruteur->id_categorie === (int) $offre->id_categorie;
    }

    public static function isVisibleToRecruteur(Recruteur $recruteur, Candidat $candidat, OffreEmploi $offre): bool
    {
        return self::canApply($candidat, $offre) && self::belongsToRecruteurDomain($recruteur, $offre);
    }

    public static function resolveRecruteurDomainOnPublish(Recruteur $recruteur, int $idCategorie): void
    {
        if (! $recruteur->id_categorie) {
            $recruteur->update(['id_categorie' => $idCategorie]);
        }
    }
}
