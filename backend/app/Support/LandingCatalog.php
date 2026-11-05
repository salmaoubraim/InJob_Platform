<?php

namespace App\Support;

/**
 * 4 offres fixes affichées sur l'accueil (catalogue / exemples).
 * Ne pas modifier l'ordre : correspond à la grille 4 colonnes.
 */
final class LandingCatalog
{
    public const TITLES = [
        'Développeur Full Stack',
        'Responsable Marketing Digital',
        'Comptable',
        'Designer UI/UX',
    ];

    public static function orderByFieldSql(): string
    {
        $escaped = array_map(
            fn (string $t) => "'".str_replace("'", "''", $t)."'",
            self::TITLES
        );

        return 'FIELD(titre, '.implode(', ', $escaped).')';
    }
}
