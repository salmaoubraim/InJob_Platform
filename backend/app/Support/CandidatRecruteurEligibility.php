<?php

namespace App\Support;

use App\Models\Candidature;
use App\Models\Message;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use Illuminate\Support\Collection;

class CandidatRecruteurEligibility
{
    public static function eligibleRecruteurIds(int $candidatId, int $candidatUserId): Collection
    {
        $fromCandidatures = Candidature::query()
            ->where('id_candidat', $candidatId)
            ->with('offre')
            ->get()
            ->pluck('offre.id_recruteur')
            ->filter();

        $partnerUserIds = Message::query()
            ->where(function ($q) use ($candidatUserId) {
                $q->where('expediteur', $candidatUserId)
                    ->orWhere('destinataire', $candidatUserId);
            })
            ->get()
            ->map(fn ($m) => (int) $m->expediteur === $candidatUserId
                ? (int) $m->destinataire
                : (int) $m->expediteur)
            ->unique()
            ->values();

        $fromMessages = Recruteur::query()
            ->whereIn('id_user', $partnerUserIds)
            ->pluck('id_recruteur');

        return $fromCandidatures->merge($fromMessages)->unique()->values();
    }

    public static function isEligible(int $candidatId, int $candidatUserId, int $recruteurId): bool
    {
        return self::eligibleRecruteurIds($candidatId, $candidatUserId)->contains($recruteurId);
    }

    /** Offres auxquelles le candidat a postulé chez ce recruteur. */
    public static function appliedOfferIds(int $candidatId, int $recruteurId): Collection
    {
        $offreIds = OffreEmploi::where('id_recruteur', $recruteurId)->pluck('id_offre');

        return Candidature::query()
            ->where('id_candidat', $candidatId)
            ->whereIn('id_offre', $offreIds)
            ->pluck('id_offre')
            ->unique()
            ->values();
    }

    public static function canReviewOffer(int $candidatId, int $candidatUserId, int $recruteurId, int $offreId): bool
    {
        if (! self::isEligible($candidatId, $candidatUserId, $recruteurId)) {
            return false;
        }

        return self::appliedOfferIds($candidatId, $recruteurId)->contains($offreId);
    }
}
