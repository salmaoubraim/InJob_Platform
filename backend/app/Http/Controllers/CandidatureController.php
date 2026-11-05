<?php

namespace App\Http\Controllers;

use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Services\NotificationService;
use App\Support\CandidatureDomainGuard;
use App\Support\CandidatureNotificationPresenter;
use App\Support\OffreImages;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class CandidatureController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $candidat = Candidat::with(['metier', 'competencesMetiers'])
            ->where('id_user', $request->user()->id_user)
            ->first();

        if (! $candidat) {
            return response()->json(['message' => 'Profil candidat introuvable.'], 403);
        }

        if (! $candidat->cvs()->exists()) {
            return response()->json([
                'message' => 'Veuillez téléverser votre CV avant de postuler à une offre.',
            ], 422);
        }

        $validated = $request->validate([
            'id_offre' => ['required', 'integer', 'exists:offres_emploi,id_offre'],
        ]);

        $offre = OffreEmploi::with(['recruteur.utilisateur', 'metier'])->findOrFail($validated['id_offre']);

        $isVisible = OffreEmploi::query()
            ->visibleToCandidat()
            ->where('id_offre', $offre->id_offre)
            ->exists();

        if (! $isVisible && ! $offre->isAvailableForCandidature()) {
            if (! filter_var($offre->est_publie, FILTER_VALIDATE_BOOLEAN)) {
                return response()->json(['message' => 'Cette offre n\'est pas encore publiée par le recruteur.'], 422);
            }

            if ($offre->date_expiration && $offre->date_expiration->format('Y-m-d') < now()->format('Y-m-d')) {
                return response()->json(['message' => 'La date limite de candidature pour cette offre est dépassée.'], 422);
            }

            return response()->json(['message' => 'Cette offre n\'est plus disponible.'], 422);
        }

        $exists = Candidature::where('id_offre', $offre->id_offre)
            ->where('id_candidat', $candidat->id_candidat)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Vous avez déjà postulé à cette offre.'], 422);
        }

        if (! CandidatureDomainGuard::canApply($candidat, $offre)) {
            return response()->json(['message' => CandidatureDomainGuard::ERROR_MESSAGE], 422);
        }

        $candidature = Candidature::create([
            'id_offre' => $offre->id_offre,
            'id_candidat' => $candidat->id_candidat,
            'statut' => 'en_attente',
            'date_candidature' => now(),
        ]);

        $candidature->load(['offre', 'candidat.utilisateur']);

        $candidatNom = trim($request->user()->prenom.' '.$request->user()->nom);
        $recruteurUserId = $offre->recruteur?->id_user;

        if ($recruteurUserId) {
            $notif = CandidatureNotificationPresenter::forRecruteur(
                $candidatNom,
                $offre->titre,
                $candidature->id_candidature
            );
            NotificationService::send(
                $recruteurUserId,
                'candidature',
                $notif['titre'],
                $notif['message'],
                $notif['lien']
            );
        }

        NotificationService::notifyAdmins(
            'candidature',
            'Nouvelle candidature',
            "{$candidatNom} — {$offre->titre}.",
            '/admin/offres'
        );

        NotificationService::send(
            $request->user()->id_user,
            'candidature',
            'Candidature envoyée',
            "Votre candidature pour « {$offre->titre} » est en attente.",
            '/candidat/candidatures'
        );

        return response()->json([
            'message' => 'Candidature envoyée avec succès.',
            'data' => $this->formatCandidature($candidature),
        ], 201);
    }

    public function candidatIndex(Request $request): JsonResponse
    {
        $candidat = Candidat::with(['metier', 'competencesMetiers'])
            ->where('id_user', $request->user()->id_user)
            ->first();

        if (! $candidat) {
            return response()->json(['data' => []]);
        }

        $items = Candidature::with(['offre.recruteur.utilisateur', 'offre.categorie'])
            ->where('id_candidat', $candidat->id_candidat)
            ->orderByDesc('date_candidature')
            ->get();

        return response()->json([
            'data' => $items->map(fn ($c) => $this->formatCandidature($c)),
        ]);
    }

    public function recruteurIndex(Request $request): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();

        if (! $recruteur) {
            return response()->json(['data' => []]);
        }

        $recruteur = \App\Support\RecruteurDomainSync::ensureDomain($recruteur);

        $items = Candidature::with(['offre', 'candidat.utilisateur', 'candidat.cvs', 'candidat.categorie'])
            ->whereHas('offre', fn ($q) => $q->where('id_recruteur', $recruteur->id_recruteur))
            ->orderByDesc('date_candidature')
            ->get()
            ->filter(function (Candidature $c) use ($recruteur) {
                if (! $c->candidat || ! $c->offre) {
                    return false;
                }

                return CandidatureDomainGuard::isVisibleToRecruteur($recruteur, $c->candidat, $c->offre);
            })
            ->values();

        return response()->json([
            'data' => $items->map(fn ($c) => $this->formatCandidature($c)),
        ]);
    }

    public function updateStatut(Request $request, int $id): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();

        if (! $recruteur) {
            return response()->json(['message' => 'Profil recruteur introuvable.'], 403);
        }

        $validated = $request->validate([
            'statut' => ['required', Rule::in(['en_attente', 'acceptee', 'refusee', 'entretien_programme'])],
            'date_entretien' => ['nullable', 'date'],
        ]);

        $candidature = Candidature::with(['offre', 'candidat.utilisateur'])
            ->whereHas('offre', fn ($q) => $q->where('id_recruteur', $recruteur->id_recruteur))
            ->findOrFail($id);

        if (
            ! $candidature->candidat
            || ! $candidature->offre
            || ! CandidatureDomainGuard::isVisibleToRecruteur($recruteur, $candidature->candidat, $candidature->offre)
        ) {
            return response()->json(['message' => 'Candidature hors de votre domaine de recrutement.'], 403);
        }

        $payload = ['statut' => $validated['statut']];
        if (Schema::hasColumn('candidatures', 'date_entretien')) {
            $payload['date_entretien'] = $validated['date_entretien'] ?? (
                $validated['statut'] === 'entretien_programme' ? now()->addDays(5) : null
            );
        }

        $candidature->update($payload);
        $candidature->load(['offre.recruteur', 'candidat.utilisateur', 'candidat.cvs']);

        $candidatUser = $candidature->candidat?->utilisateur;
        $notifMap = [
            'en_attente' => ['candidature', 'Candidature en attente', 'en attente'],
            'acceptee' => ['candidature_acceptee', 'Candidature acceptée', 'acceptée'],
            'refusee' => ['candidature_refusee', 'Candidature refusée', 'refusée'],
            'entretien_programme' => ['entretien', 'Entretien programmé', 'en entretien'],
        ];
        [$type, $titre, $label] = $notifMap[$validated['statut']] ?? ['candidature', 'Mise à jour', $validated['statut']];

        if ($candidatUser) {
            $msg = "Votre candidature pour « {$candidature->offre?->titre} » est {$label}.";
            if ($validated['statut'] === 'entretien_programme' && $candidature->date_entretien) {
                $msg .= ' Date : '.$candidature->date_entretien->format('d/m/Y H:i');
            }
            try {
                NotificationService::send(
                    $candidatUser->id_user,
                    $type,
                    $titre,
                    $msg,
                    '/candidat/candidatures'
                );
            } catch (\Throwable) {
                // Le statut est enregistré même si la notification échoue.
            }
        }

        return response()->json([
            'message' => 'Statut mis à jour avec succès.',
            'data' => $this->formatCandidature($candidature),
        ]);
    }

    public function candidatDestroy(Request $request, int $id): JsonResponse
    {
        $candidat = Candidat::with(['metier', 'competencesMetiers'])
            ->where('id_user', $request->user()->id_user)
            ->first();

        if (! $candidat) {
            return response()->json(['message' => 'Profil candidat introuvable.'], 403);
        }

        $candidature = Candidature::where('id_candidat', $candidat->id_candidat)->findOrFail($id);
        $candidature->delete();

        return response()->json(['message' => 'Candidature annulée.']);
    }

    public function candidatDestroyAll(Request $request): JsonResponse
    {
        $candidat = Candidat::with(['metier', 'competencesMetiers'])
            ->where('id_user', $request->user()->id_user)
            ->first();

        if (! $candidat) {
            return response()->json(['message' => 'Profil candidat introuvable.'], 403);
        }

        $deleted = Candidature::where('id_candidat', $candidat->id_candidat)->delete();

        return response()->json([
            'message' => $deleted > 0
                ? "{$deleted} candidature(s) annulée(s)."
                : 'Aucune candidature à annuler.',
            'deleted' => $deleted,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();

        if (! $recruteur) {
            return response()->json(['message' => 'Profil recruteur introuvable.'], 403);
        }

        $candidature = Candidature::with(['offre', 'candidat'])
            ->whereHas('offre', fn ($q) => $q->where('id_recruteur', $recruteur->id_recruteur))
            ->findOrFail($id);

        if (
            ! $candidature->candidat
            || ! $candidature->offre
            || ! CandidatureDomainGuard::isVisibleToRecruteur($recruteur, $candidature->candidat, $candidature->offre)
        ) {
            return response()->json(['message' => 'Candidature hors de votre domaine de recrutement.'], 403);
        }

        $candidature->delete();

        return response()->json(['message' => 'Candidature supprimée.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();

        if (! $recruteur) {
            return response()->json(['message' => 'Profil recruteur introuvable.'], 403);
        }

        $recruteur = \App\Support\RecruteurDomainSync::ensureDomain($recruteur);

        $candidatures = Candidature::with(['offre', 'candidat'])
            ->whereHas('offre', fn ($q) => $q->where('id_recruteur', $recruteur->id_recruteur))
            ->get()
            ->filter(function (Candidature $c) use ($recruteur) {
                if (! $c->candidat || ! $c->offre) {
                    return false;
                }

                return CandidatureDomainGuard::isVisibleToRecruteur($recruteur, $c->candidat, $c->offre);
            });

        $deleted = 0;
        foreach ($candidatures as $candidature) {
            $candidature->delete();
            $deleted++;
        }

        return response()->json([
            'message' => $deleted > 0
                ? "{$deleted} candidature(s) supprimée(s)."
                : 'Aucune candidature à supprimer.',
            'deleted' => $deleted,
        ]);
    }

    public function showCandidat(Request $request, int $idCandidat): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $hasApplication = Candidature::where('id_candidat', $idCandidat)
            ->whereHas('offre', fn ($q) => $q->where('id_recruteur', $recruteur->id_recruteur))
            ->exists();

        if (! $hasApplication) {
            return response()->json(['message' => 'Candidat introuvable.'], 404);
        }

        $candidat = Candidat::with(['utilisateur', 'cvs'])->findOrFail($idCandidat);
        $user = $candidat->utilisateur;
        $cv = $candidat->cvs->first();

        return response()->json([
            'data' => [
                'id_candidat' => $candidat->id_candidat,
                'id_user' => $user?->id_user,
                'nom' => $user?->nom,
                'prenom' => $user?->prenom,
                'email' => $user?->email,
                'telephone' => $user?->telephone,
                'ville' => $candidat->ville,
                'adresse' => $candidat->adresse,
                'competences' => $candidat->competences,
                'experience' => $candidat->experience,
                'cv' => $cv ? [
                    'id_cv' => $cv->id_cv,
                    'nom_fichier' => $cv->nom_fichier,
                    'url' => url($cv->chemin_fichier),
                ] : null,
            ],
        ]);
    }

    private function formatCandidature(Candidature $c): array
    {
        $offre = $c->offre;
        $candidatUser = $c->candidat?->utilisateur;
        $cv = $c->candidat?->cvs?->first();
        $recruteurUser = $offre?->recruteur?->utilisateur;

        return [
            'id_candidature' => $c->id_candidature,
            'statut' => $c->statut,
            'date_candidature' => $c->date_candidature?->toIso8601String(),
            'date_entretien' => $c->date_entretien?->toIso8601String(),
            'date_entretien_label' => $c->date_entretien?->format('d/m/Y H:i'),
            'date_label' => $c->date_candidature?->locale('fr')->diffForHumans(),
            'offre' => $offre ? [
                'id_offre' => $offre->id_offre,
                'titre' => $offre->titre,
                'entreprise' => $offre->recruteur?->nom_entreprise,
                'recruteur_nom' => $offre->recruteur?->nom_entreprise ?? 'Entreprise',
                'ville' => $offre->ville,
                'type_contrat' => $offre->type_contrat,
                'salaire' => $offre->salaire ? number_format((float) $offre->salaire, 0, ',', ' ').' MAD' : 'À discuter',
                'image' => OffreImages::forOffre($offre),
            ] : null,
            'candidat' => $candidatUser ? [
                'id_candidat' => $c->candidat?->id_candidat,
                'id_user' => $candidatUser->id_user,
                'nom' => $candidatUser->nom,
                'prenom' => $candidatUser->prenom,
                'email' => $candidatUser->email,
                'telephone' => $candidatUser->telephone,
                'ville' => $c->candidat?->ville,
                'competences' => $c->candidat?->competences,
                'a_cv' => (bool) $cv,
                'id_cv' => $cv?->id_cv,
            ] : null,
            'recruteur_id_user' => $recruteurUser?->id_user,
        ];
    }
}
