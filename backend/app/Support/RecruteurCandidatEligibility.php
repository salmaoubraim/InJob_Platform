<?php

namespace App\Support;

use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\Message;
use App\Models\OffreEmploi;
use Illuminate\Support\Collection;

class RecruteurCandidatEligibility
{
    public static function eligibleCandidatIds(int $recruteurId, int $recruteurUserId): Collection
    {
        $offreIds = OffreEmploi::where('id_recruteur', $recruteurId)->pluck('id_offre');

        $fromCandidatures = Candidature::query()
            ->whereIn('id_offre', $offreIds)
            ->pluck('id_candidat');

        $partnerUserIds = Message::query()
            ->where(function ($q) use ($recruteurUserId) {
                $q->where('expediteur', $recruteurUserId)
                    ->orWhere('destinataire', $recruteurUserId);
            })
            ->get()
            ->map(fn ($m) => (int) $m->expediteur === $recruteurUserId
                ? (int) $m->destinataire
                : (int) $m->expediteur)
            ->unique()
            ->values();

        $fromMessages = Candidat::query()
            ->whereIn('id_user', $partnerUserIds)
            ->pluck('id_candidat');

        return $fromCandidatures->merge($fromMessages)->unique()->values();
    }

    public static function isEligible(int $recruteurId, int $recruteurUserId, int $candidatId): bool
    {
        return self::eligibleCandidatIds($recruteurId, $recruteurUserId)->contains($candidatId);
    }

    public static function offerIdsForCandidat(int $recruteurId, int $candidatId): Collection
    {
        $offreIds = OffreEmploi::where('id_recruteur', $recruteurId)->pluck('id_offre');

        $appliedOffreIds = Candidature::query()
            ->where('id_candidat', $candidatId)
            ->whereIn('id_offre', $offreIds)
            ->pluck('id_offre');

        if ($appliedOffreIds->isNotEmpty()) {
            return $appliedOffreIds->unique()->values();
        }

        return $offreIds->unique()->values();
    }

    public static function canUseOffer(int $recruteurId, int $candidatId, int $offreId): bool
    {
        return self::offerIdsForCandidat($recruteurId, $candidatId)->contains($offreId);
    }
}
