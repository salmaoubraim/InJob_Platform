<?php

namespace App\Http\Controllers;

use App\Models\AvisRecruteur;
use App\Models\Candidat;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Services\NotificationService;
use App\Support\CandidatRecruteurEligibility;
use App\Support\UserPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisRecruteurController extends Controller
{
    public function eligibles(Request $request): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $eligibleIds = CandidatRecruteurEligibility::eligibleRecruteurIds(
            $candidat->id_candidat,
            $request->user()->id_user
        );

        if ($eligibleIds->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $recruteurs = Recruteur::with('utilisateur')
            ->whereIn('id_recruteur', $eligibleIds)
            ->get()
            ->sortBy(fn ($r) => strtolower($r->nom_entreprise ?? ''))
            ->values();

        return response()->json([
            'data' => $recruteurs->map(function (Recruteur $recruteur) use ($candidat) {
                $user = $recruteur->utilisateur;
                $appliedCount = CandidatRecruteurEligibility::appliedOfferIds(
                    $candidat->id_candidat,
                    $recruteur->id_recruteur
                )->count();

                return [
                    'id_recruteur' => $recruteur->id_recruteur,
                    'nom_entreprise' => $recruteur->nom_entreprise,
                    'recruteur_nom' => $user ? trim($user->prenom.' '.$user->nom) : null,
                    'recruteur_prenom' => $user?->prenom,
                    'photo_url' => UserPresenter::photoUrl($user?->photo_profil),
                    'nb_offres_postulees' => $appliedCount,
                ];
            }),
        ]);
    }

    public function offresForRecruteur(Request $request, int $idRecruteur): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        if (! CandidatRecruteurEligibility::isEligible(
            $candidat->id_candidat,
            $request->user()->id_user,
            $idRecruteur
        )) {
            return response()->json(['message' => 'Recruteur non éligible.'], 403);
        }

        $offerIds = CandidatRecruteurEligibility::appliedOfferIds($candidat->id_candidat, $idRecruteur);

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

    public function indexCandidat(Request $request): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $items = AvisRecruteur::with(['recruteur.utilisateur', 'offre'])
            ->where('est_masque', false)
            ->where('id_candidat', $candidat->id_candidat)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $items->map(fn ($a) => $this->format($a, 'candidat')),
        ]);
    }

    public function indexRecruteur(Request $request): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['data' => []]);
        }

        $items = AvisRecruteur::with(['candidat.utilisateur', 'offre'])
            ->where('est_masque', false)
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $items->map(fn ($a) => $this->format($a, 'recruteur')),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $validated = $request->validate([
            'id_recruteur' => ['required', 'integer', 'exists:recruteurs,id_recruteur'],
            'id_offre' => ['required', 'integer', 'exists:offres_emploi,id_offre'],
            'note' => ['required', 'integer', 'min:1', 'max:5'],
            'commentaire' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $idRecruteur = (int) $validated['id_recruteur'];
        $idOffre = (int) $validated['id_offre'];

        if (! CandidatRecruteurEligibility::canReviewOffer(
            $candidat->id_candidat,
            $request->user()->id_user,
            $idRecruteur,
            $idOffre
        )) {
            return response()->json([
                'message' => 'Vous ne pouvez commenter que les offres auxquelles vous avez postulé, auprès des recruteurs avec lesquels vous avez interagi.',
            ], 403);
        }

        $existing = AvisRecruteur::query()
            ->where('id_candidat', $candidat->id_candidat)
            ->where('id_recruteur', $idRecruteur)
            ->where('id_offre', $idOffre)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Vous avez déjà publié un avis pour cette offre.',
            ], 422);
        }

        $avis = AvisRecruteur::create([
            'id_candidat' => $candidat->id_candidat,
            'id_recruteur' => $idRecruteur,
            'id_offre' => $idOffre,
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
            'created_at' => now(),
        ]);

        $avis->load(['recruteur.utilisateur', 'offre', 'candidat.utilisateur']);

        $recruteurUserId = $avis->recruteur?->id_user;
        $candidatNom = trim($request->user()->prenom.' '.$request->user()->nom);

        if ($recruteurUserId) {
            NotificationService::send(
                $recruteurUserId,
                'avis',
                'Nouvel avis candidat',
                "{$candidatNom} a commenté votre offre « {$avis->offre?->titre} » ({$avis->note}/5).",
                '/recruteur/avis'
            );
        }

        return response()->json([
            'message' => 'Avis publié sur le recruteur.',
            'data' => $this->format($avis, 'candidat'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $validated = $request->validate([
            'note' => ['required', 'integer', 'min:1', 'max:5'],
            'commentaire' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $avis = AvisRecruteur::findOrFail($id);

        if ((int) $avis->id_candidat !== (int) $candidat->id_candidat) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $avis->update([
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
        ]);

        $avis->load(['recruteur.utilisateur', 'offre', 'candidat.utilisateur']);

        return response()->json([
            'message' => 'Avis mis à jour.',
            'data' => $this->format($avis, 'candidat'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $avis = AvisRecruteur::findOrFail($id);

        if ((int) $avis->id_candidat !== (int) $candidat->id_candidat) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $avis->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }

    public function destroyMany(Request $request): JsonResponse
    {
        $candidat = $this->requireCandidat($request);
        if ($candidat instanceof JsonResponse) {
            return $candidat;
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $deleted = AvisRecruteur::query()
            ->where('id_candidat', $candidat->id_candidat)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return response()->json([
            'message' => "{$deleted} avis supprimé(s).",
            'deleted' => $deleted,
        ]);
    }

    public function destroyRecruteurMany(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'recruteur') {
            return response()->json(['message' => 'Accès réservé aux recruteurs.'], 403);
        }

        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['message' => 'Profil recruteur introuvable.'], 403);
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $deleted = AvisRecruteur::query()
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return response()->json([
            'message' => "{$deleted} avis supprimé(s).",
            'deleted' => $deleted,
        ]);
    }

    public function destroyRecruteur(Request $request, int $id): JsonResponse
    {
        if ($request->user()->role !== 'recruteur') {
            return response()->json(['message' => 'Accès réservé aux recruteurs.'], 403);
        }

        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['message' => 'Profil recruteur introuvable.'], 403);
        }

        $avis = AvisRecruteur::findOrFail($id);

        if ((int) $avis->id_recruteur !== (int) $recruteur->id_recruteur) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $avis->delete();

        return response()->json(['message' => 'Avis supprimé.']);
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

    private function format(AvisRecruteur $a, string $perspective): array
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
            'id_recruteur' => $a->id_recruteur,
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
