<?php

namespace App\Support;

use App\Models\Candidat;
use App\Models\Categorie;
use App\Models\Metier;

class CandidatCompetenceSync
{
    public static function applyTo(Candidat $candidat): void
    {
        $candidat->loadMissing(['utilisateur', 'categorie']);
        $email = strtolower(trim((string) ($candidat->utilisateur?->email ?? '')));

        $profile = CandidatCompetenceProfiles::byEmail()[$email] ?? null;

        if (! $profile) {
            $catName = $candidat->categorie?->nom_categorie;
            $profile = $catName
                ? (CandidatCompetenceProfiles::fallbackByCategory()[$catName] ?? null)
                : null;
        }

        if (! $profile) {
            $profile = [
                'metier' => 'Développeur Full Stack',
                'competences' => trim((string) ($candidat->competences ?? '')) ?: 'Compétences professionnelles',
                'competence_metiers' => [],
            ];
        }

        $mainMetier = MetierResolver::findByName($profile['metier']);
        if (! $mainMetier && $candidat->id_categorie) {
            $mainMetier = Metier::where('id_categorie', $candidat->id_categorie)->first();
        }

        $updates = [
            'competences' => $profile['competences'],
        ];

        if ($mainMetier) {
            $updates['id_metier'] = $mainMetier->id_metier;
            if (! $candidat->id_categorie) {
                $updates['id_categorie'] = $mainMetier->id_categorie;
            }
        }

        $candidat->update($updates);

        $extraIds = MetierResolver::findIdsByNames($profile['competence_metiers']);
        if ($mainMetier) {
            $extraIds = array_values(array_filter(
                $extraIds,
                fn (int $id) => $id !== (int) $mainMetier->id_metier
            ));
        }

        if ($extraIds !== []) {
            $candidat->competencesMetiers()->sync($extraIds);
        } else {
            $candidat->competencesMetiers()->detach();
        }
    }

    public static function applyToAll(): int
    {
        $count = 0;
        Candidat::with(['utilisateur', 'categorie'])->get()->each(function (Candidat $candidat) use (&$count) {
            self::applyTo($candidat);
            $count++;
        });

        return $count;
    }

    public static function ensureTechMetiers(): void
    {
        $devWeb = Categorie::where('nom_categorie', 'Informatique & tech')->first();
        if (! $devWeb) {
            return;
        }

        foreach ([
            'Développeur PHP Laravel' => 'API REST, Laravel et MySQL.',
            'Développeur Frontend React' => 'Interfaces React, TypeScript et intégration API.',
        ] as $nom => $desc) {
            Metier::firstOrCreate(
                ['id_categorie' => $devWeb->id_categorie, 'nom_metier' => $nom],
                ['description' => $desc]
            );
        }

        $marketing = Categorie::where('nom_categorie', 'Marketing')->first()
            ?? Categorie::where('nom_categorie', 'like', '%Marketing%')->first();

        if ($marketing) {
            Metier::firstOrCreate(
                ['id_categorie' => $marketing->id_categorie, 'nom_metier' => 'Chargé Marketing Digital'],
                ['description' => 'Stratégie digitale et campagnes en ligne']
            );
        }
    }
}
