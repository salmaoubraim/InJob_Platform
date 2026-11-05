<?php

namespace App\Http\Controllers;

use App\Models\AvisRecruteurCandidat;
use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Services\NotificationService;
use App\Support\RecruteurCandidatEligibility;
use App\Support\UserPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisRecruteurCandidatController extends Controller
{
    public function eligibles(Request $request): JsonResponse
    {
        $recruteur = $this->requireRecruteur($request);
        if ($recruteur instanceof JsonResponse) {
            return $recruteur;
        }

        $eligibleIds = RecruteurCandidatEligibility::eligibleCandidatIds(
            $recruteur->id_recruteur,
            $request->user()->id_user
        );

        if ($eligibleIds->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $offreIds = OffreEmploi::where('id_recruteur', $recruteur->id_recruteur)->pluck('id_offre');

        $candidaturesByCandidat = Candidature::query()
            ->whereIn('id_offre', $offreIds)
            ->whereIn('id_candidat', $eligibleIds)
            ->with('offre')
            ->get()
            ->groupBy('id_candidat');

        $candidats = Candidat::with('utilisateur')
            ->whereIn('id_candidat', $eligibleIds)
            ->get()
            ->sortBy(fn ($c) => strtolower(trim(($c->utilisateur?->prenom ?? '').' '.($c->utilisateur?->nom ?? ''))))
            ->values();

        return response()->json([
            'data' => $candidats->map(function (Candidat $candidat) use ($candidaturesByCandidat, $recruteur) {
                $user = $candidat->utilisateur;
                $candidatures = $candidaturesByCandidat->get($candidat->id_candidat, collect());
                $viaCandidature = $candidatures->isNotEmpty();
                $derniereOffre = $candidatures->sortByDesc('date_candidature')->first()?->offre;

                return [
                    'id_candidat' => $candidat->id_candidat,
                    'nom' => $user?->nom,
                    'prenom' => $user?->prenom,
                    'nom_complet' => $user ? trim($user->prenom.' '.$user->nom) : 'Candidat',
                    'photo_url' => UserPresenter::photoUrl($user?->photo_profil),
                    'ville' => $candidat->ville,
                    'via_candidature' => $viaCandidature,
                    'via_message' => ! $viaCandidature,
                    'poste_recent' => $derniereOffre?->titre,
                    'nb_candidatures' => $candidatures->count(),
                ];
            }),
        ]);
    }

    public function offresForCandidat(Request $request, int $idCandidat): JsonResponse
    {
        $recruteur = $this->requireRecruteur($request);
        if ($recruteur instanceof JsonResponse) {
            return $recruteur;
        }

        if (! RecruteurCandidatEligibility::isEligible(
            $recruteur->id_recruteur,
            $request->user()->id_user,
            $idCandidat
        )) {
            return response()->json(['message' => 'Ce candidat ne peut pas être évalué.'], 403);
        }

        $offerIds = RecruteurCandidatEligibility::offerIdsForCandidat($recruteur->id_recruteur, $idCandidat);

        $offres = OffreEmploi::whereIn('id_offre', $offerIds)
            ->orderByDesc('date_publication')
            ->get();

        return response()->json([
            'data' => $offres->map(fn (OffreEmploi $o) => [
                'id_offre' => $o->id_offre,
                'titre' => $o->titre,
                'ville' => $o->ville,
                'type_contrat' => $o->type_contrat,
            ]),
        ]);
    }

    public function indexRecruteur(Request $request): JsonResponse
    {
        $recruteur = $this->requireRecruteur($request);
        if ($recruteur instanceof JsonResponse) {
            return $recruteur;
        }

        $items = AvisRecruteurCandidat::with(['candidat.utilisateur', 'offre'])
            ->where('est_masque', false)
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $items->map(fn ($a) => $this->format($a, 'recruteur')),
        ]);
    }

    public function indexCandidat(Request $request): JsonResponse
    {
        $candidat = $request->user()->candidat;
        if (! $candidat) {
            return response()->json(['data' => []]);
        }

        $items = AvisRecruteurCandidat::with(['recruteur.utilisateur', 'offre'])
            ->where('est_masque', false)
            ->where('id_candidat', $candidat->id_candidat)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $items->map(fn ($a) => $this->format($a, 'candidat')),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $recruteur = $this->requireRecruteur($request);
        if ($recruteur instanceof JsonResponse) {
            return $recruteur;
        }

        $validated = $request->validate([
            'id_candidat' => ['required', 'integer', 'exists:candidats,id_candidat'],
            'id_offre' => ['required', 'integer', 'exists:offres_emploi,id_offre'],
            'note' => ['required', 'integer', 'min:1', 'max:5'],
            'commentaire' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $idCandidat = (int) $validated['id_candidat'];
        $idOffre = (int) $validated['id_offre'];

        if (! RecruteurCandidatEligibility::isEligible(
            $recruteur->id_recruteur,
            $request->user()->id_user,
            $idCandidat
        )) {
            return response()->json([
                'message' => 'Vous ne pouvez évaluer que les candidats ayant postulé à vos offres ou avec lesquels vous avez échangé.',
            ], 403);
        }

        if (! RecruteurCandidatEligibility::canUseOffer($recruteur->id_recruteur, $idCandidat, $idOffre)) {
            return response()->json(['message' => 'Offre non valide pour ce candidat.'], 422);
        }

        $offreBelongsToRecruteur = OffreEmploi::query()
            ->where('id_offre', $idOffre)
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->exists();

        if (! $offreBelongsToRecruteur) {
            return response()->json(['message' => 'Cette offre ne vous appartient pas.'], 403);
        }

        $existing = AvisRecruteurCandidat::query()
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->where('id_candidat', $idCandidat)
            ->where('id_offre', $idOffre)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Vous avez déjà laissé un avis pour ce candidat sur cette offre.',
            ], 422);
        }

        $avis = AvisRecruteurCandidat::create([
            'id_recruteur' => $recruteur->id_recruteur,
            'id_candidat' => $idCandidat,
            'id_offre' => $idOffre,
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
            'created_at' => now(),
        ]);

        $avis->load(['candidat.utilisateur', 'offre', 'recruteur.utilisateur']);

        $candidatUserId = $avis->candidat?->id_user;
        $recruteurNom = trim($request->user()->prenom.' '.$request->user()->nom);
        $entreprise = $recruteur->nom_entreprise ?: $recruteurNom;

        if ($candidatUserId) {
            NotificationService::send(
                $candidatUserId,
                'avis',
                'Nouvel avis de recruteur',
                "{$entreprise} vous a évalué(e) pour « {$avis->offre?->titre} » ({$avis->note}/5).",
                '/candidat/avis'
            );
        }

        return response()->json([
            'message' => 'Avis publié sur le candidat.',
            'data' => $this->format($avis, 'recruteur'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $recruteur = $this->requireRecruteur($request);
        if ($recruteur instanceof JsonResponse) {
            return $recruteur;
        }

        $validated = $request->validate([
            'note' => ['required', 'integer', 'min:1', 'max:5'],
            'commentaire' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $avis = AvisRecruteurCandidat::findOrFail($id);

        if ((int) $avis->id_recruteur !== (int) $recruteur->id_recruteur) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $avis->update([
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
        ]);

        $avis->load(['candidat.utilisateur', 'offre', 'recruteur.utilisateur']);

        return response()->json([
            'message' => 'Évaluation mise à jour.',
            'data' => $this->format($avis, 'recruteur'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $recruteur = $this->requireRecruteur($request);
        if ($recruteur instanceof JsonResponse) {
            return $recruteur;
        }

        $avis = AvisRecruteurCandidat::findOrFail($id);

        if ((int) $avis->id_recruteur !== (int) $recruteur->id_recruteur) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $avis->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }

    public function destroyMany(Request $request): JsonResponse
    {
        $recruteur = $this->requireRecruteur($request);
        if ($recruteur instanceof JsonResponse) {
            return $recruteur;
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $deleted = AvisRecruteurCandidat::query()
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return response()->json([
            'message' => "{$deleted} avis supprimé(s).",
            'deleted' => $deleted,
        ]);
    }

    public function destroyCandidat(Request $request, int $id): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $avis = AvisRecruteurCandidat::findOrFail($id);

        if ((int) $avis->id_candidat !== (int) $candidat->id_candidat) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $avis->delete();

        return response()->json(['message' => 'Évaluation supprimée.']);
    }

    public function destroyCandidatMany(Request $request): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $deleted = AvisRecruteurCandidat::query()
            ->where('id_candidat', $candidat->id_candidat)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return response()->json([
            'message' => "{$deleted} évaluation(s) supprimée(s).",
            'deleted' => $deleted,
        ]);
    }

    private function requireCandidat(Request $request): Candidat|JsonResponse
    {
        if ($request->user()->role !== 'candidat') {
            return response()->json(['message' => 'Accès réservé aux candidats.'], 403);
        }

        $candidat = $request->user()->candidat;
        if (! $candidat) {
            return response()->json(['message' => 'Profil candidat introuvable.'], 403);
        }

        return $candidat;
    }

    private function requireRecruteur(Request $request): Recruteur|JsonResponse
    {
        if ($request->user()->role !== 'recruteur') {
            return response()->json(['message' => 'Accès réservé aux recruteurs.'], 403);
        }

        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['message' => 'Profil recruteur introuvable.'], 403);
        }

        return $recruteur;
    }

    private function format(AvisRecruteurCandidat $a, string $perspective): array
    {
        $candidatUser = $a->candidat?->utilisateur;
        $recruteurUser = $a->recruteur?->utilisateur;

        return [
            'id' => $a->id,
            'note' => (int) $a->note,
            'commentaire' => $a->commentaire,
            'created_at' => $a->created_at?->toIso8601String(),
            'date_label' => $a->created_at?->locale('fr')->diffForHumans(),
            'id_offre' => $a->id_offre,
            'offre_titre' => $a->offre?->titre,
            'id_candidat' => $a->id_candidat,
            'candidat_nom' => $candidatUser ? trim($candidatUser->prenom.' '.$candidatUser->nom) : null,
            'candidat_photo_url' => UserPresenter::photoUrl($candidatUser?->photo_profil),
            'recruteur_nom' => $recruteurUser ? trim($recruteurUser->prenom.' '.$recruteurUser->nom) : null,
            'entreprise' => $a->recruteur?->nom_entreprise,
            'recruteur_photo_url' => UserPresenter::photoUrl($recruteurUser?->photo_profil),
            'perspective' => $perspective,
        ];
    }
}
