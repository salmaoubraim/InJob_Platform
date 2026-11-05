<?php

namespace App\Support;

use App\Models\Notification;

class CandidatureNotificationPresenter
{
    public static function forRecruteur(string $candidatNom, string $offreTitre, int $idCandidature): array
    {
        return [
            'titre' => $candidatNom,
            'message' => "A postulé à votre offre « {$offreTitre} ».",
            'lien' => '/recruteur/candidatures?id_candidature='.$idCandidature,
        ];
    }

    public static function parse(Notification $notification): ?array
    {
        $type = $notification->type ?? $notification->type_notification ?? null;

        if ($type !== 'candidature') {
            return null;
        }

        $message = $notification->message ?? $notification->contenu ?? '';

        if (preg_match('/A postulé à votre offre « (.+?) »\.?$/u', $message, $match)) {
            $nom = trim($notification->titre);
            if ($nom && ! in_array($nom, ['Nouvelle candidature', 'Candidature reçue'], true)) {
                return [
                    'candidat_nom' => $nom,
                    'offre_titre' => trim($match[1]),
                ];
            }
        }

        if (preg_match('/^(.+?) a postulé à « (.+?) »\.?$/u', $message, $match)) {
            return [
                'candidat_nom' => trim($match[1]),
                'offre_titre' => trim($match[2]),
            ];
        }

        if (str_contains($notification->titre, ' · ')) {
            [$nom, $offre] = explode(' · ', $notification->titre, 2);

            return [
                'candidat_nom' => trim($nom),
                'offre_titre' => trim($offre),
            ];
        }

        if (preg_match('/^(.+?) a postulé/u', $message, $match)) {
            return [
                'candidat_nom' => trim($match[1]),
                'offre_titre' => null,
            ];
        }

        return null;
    }

    public static function enrich(array $formatted, Notification $notification): array
    {
        $parsed = self::parse($notification);
        if (! $parsed) {
            return $formatted;
        }

        $formatted['candidat_nom'] = $parsed['candidat_nom'];
        $formatted['offre_titre'] = $parsed['offre_titre'];

        return $formatted;
    }
}
