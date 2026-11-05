<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'recruteur') {
            $recruteur = Recruteur::where('id_user', $user->id_user)->first();
            if (! $recruteur) {
                return response()->json(['data' => []]);
            }

            $offreIds = OffreEmploi::where('id_recruteur', $recruteur->id_recruteur)->pluck('id_offre');

            $items = Avis::with(['utilisateur', 'offre'])
                ->where('est_masque', false)
                ->whereIn('id_offre', $offreIds)
                ->whereNotNull('id_offre')
                ->where('id_user', '!=', $user->id_user)
                ->whereHas('utilisateur', fn ($q) => $q->where('role', 'candidat'))
                ->orderByDesc('created_at')
                ->limit(100)
                ->get();
        } elseif ($user->role === 'admin') {
            $items = Avis::with(['utilisateur', 'offre'])
                ->orderByDesc('created_at')
                ->limit(100)
                ->get();
        } else {
            $items = Avis::with(['utilisateur', 'offre'])
                ->where('est_masque', false)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get();
        }

        return response()->json([
            'data' => $items->map(fn ($a) => $this->format($a)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'note' => ['required', 'integer', 'min:1', 'max:5'],
            'commentaire' => ['required', 'string', 'min:10', 'max:2000'],
            'id_offre' => ['nullable', 'exists:offres_emploi,id_offre'],
        ]);

        if ($request->user()->role === 'recruteur') {
            return response()->json([
                'message' => 'Les recruteurs consultent uniquement les avis reçus sur leurs offres.',
            ], 403);
        }

        if ($request->user()->role === 'candidat') {
            return response()->json([
                'message' => 'Publiez un avis ciblé via la page Avis : choisissez un recruteur et une offre concernée.',
            ], 403);
        }

        $avis = Avis::create([
            'id_user' => $request->user()->id_user,
            'id_offre' => $validated['id_offre'] ?? null,
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
            'created_at' => now(),
        ]);

        $avis->load(['utilisateur', 'offre.recruteur']);

        $auteur = trim($request->user()->prenom.' '.$request->user()->nom);
        $recruteurUserId = $avis->offre?->recruteur?->id_user;

        if ($recruteurUserId) {
            NotificationService::send(
                $recruteurUserId,
                'avis',
                'Nouvel avis reçu',
                "{$auteur} a laissé un avis sur « {$avis->offre?->titre} » ({$avis->note}/5).",
                '/recruteur/avis'
            );
        }

        NotificationService::notifyAdmins(
            'avis',
            'Nouvel avis',
            "{$auteur} — note {$avis->note}/5.",
            '/admin/avis'
        );

        return response()->json([
            'message' => 'Avis publié.',
            'data' => $this->format($avis),
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $avis = Avis::findOrFail($id);
        if (! $this->recruteurOwnsAvis($avis, $recruteur)) {
            return response()->json(['message' => 'Cet avis ne vous est pas destiné.'], 403);
        }

        $avis->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $offreIds = OffreEmploi::where('id_recruteur', $recruteur->id_recruteur)->pluck('id_offre');

        $deleted = Avis::query()
            ->whereIn('id_offre', $offreIds)
            ->whereNotNull('id_offre')
            ->where('id_user', '!=', $request->user()->id_user)
            ->whereHas('utilisateur', fn ($q) => $q->where('role', 'candidat'))
            ->delete();

        return response()->json([
            'message' => $deleted > 0
                ? "{$deleted} avis supprimé(s)."
                : 'Aucun avis à supprimer.',
            'deleted' => $deleted,
        ]);
    }

    public function destroyMany(Request $request): JsonResponse
    {
        $recruteur = Recruteur::where('id_user', $request->user()->id_user)->first();
        if (! $recruteur) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $deleted = 0;
        foreach ($validated['ids'] as $id) {
            $avis = Avis::find($id);
            if ($avis && $this->recruteurOwnsAvis($avis, $recruteur)) {
                $avis->delete();
                $deleted++;
            }
        }

        return response()->json([
            'message' => "{$deleted} avis supprimé(s).",
            'deleted' => $deleted,
        ]);
    }

    private function recruteurOwnsAvis(Avis $avis, Recruteur $recruteur): bool
    {
        if (! $avis->id_offre) {
            return false;
        }

        return OffreEmploi::query()
            ->where('id_offre', $avis->id_offre)
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->exists();
    }

    private function format(Avis $a): array
    {
        $user = $a->utilisateur;

        return [
            'id_avis' => $a->id_avis,
            'note' => (int) $a->note,
            'commentaire' => $a->commentaire,
            'created_at' => $a->created_at?->toIso8601String(),
            'date_label' => $a->created_at?->locale('fr')->diffForHumans(),
            'offre_titre' => $a->offre?->titre,
            'id_offre' => $a->id_offre,
            'auteur' => $user ? trim($user->prenom.' '.$user->nom) : 'Anonyme',
            'role' => $user?->role,
        ];
    }
}

