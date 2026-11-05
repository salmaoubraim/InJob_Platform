<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Metier;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Services\NotificationService;
use App\Support\CandidatureDomainGuard;
use App\Support\LandingCatalog;
use App\Support\OffreImages;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OffreEmploiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OffreEmploi::query()
            ->with(['recruteur.utilisateur', 'categorie', 'metier'])
            ->withCount('candidatures');

        if (! $request->boolean('include_expired')) {
            $query->visibleToCandidat();
        } else {
            $query->publishedActive();
        }

        $this->applySearch($query, $request->get('q'));

        if ($request->filled('ville')) {
            $query->where('ville', 'like', '%'.$request->ville.'%');
        }

        if ($request->filled('id_categorie')) {
            $query->where('id_categorie', $request->id_categorie);
        }

        if ($request->filled('id_metier')) {
            $query->where('id_metier', $request->id_metier);
        }

        if ($request->filled('type_contrat')) {
            $query->where('type_contrat', $request->type_contrat);
        }

        if ($request->filled('salaire_min')) {
            $query->where('salaire', '>=', (float) $request->salaire_min);
        }

        if ($request->boolean('recent')) {
            // Accueil : 4 offres catalogue fixes (toujours les mêmes titres)
            $query->whereIn('titre', LandingCatalog::TITLES);
            $limit = min(max((int) $request->get('limit', 4), 1), 4);
            $offres = $query
                ->orderByRaw(LandingCatalog::orderByFieldSql())
                ->limit($limit)
                ->get();
        } else {
            $requested = (int) $request->get('limit', 100);
            $scope = $request->get('scope', '');

            if ($scope === 'candidat') {
                $limit = min(max($requested, 1), 200);
                $query->whereNotIn('titre', LandingCatalog::TITLES);
            } else {
                // Espace candidat legacy : 6 offres max (hors catalogue fixe de l'accueil)
                $limit = $requested <= 6
                    ? min(max($requested, 1), 6)
                    : min($requested, 100);

                if ($limit <= 6) {
                    $query->whereNotIn('titre', LandingCatalog::TITLES);
                }
            }

            $offres = (clone $query)
                ->orderByRaw('CASE WHEN image_offre IS NOT NULL AND image_offre != \'\' THEN 0 ELSE 1 END')
                ->orderByDesc('date_publication')
                ->limit($limit)
                ->get();
        }

        return response()->json([
            'data' => $offres->map(fn ($o) => $this->formatOffre($o)),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $offre = OffreEmploi::query()
            ->with(['recruteur.utilisateur', 'categorie', 'metier'])
            ->withCount('candidatures')
            ->findOrFail($id);

        if (! $offre->isAvailableForCandidature()) {
            return response()->json(['message' => 'Cette offre n\'est plus disponible.'], 404);
        }

        return response()->json([
            'data' => $this->formatOffre($offre),
        ]);
    }

    public function categories(): JsonResponse
    {
        $cats = Categorie::orderBy('nom_categorie')->get(['id_categorie', 'nom_categorie']);

        return response()->json(['data' => $cats]);
    }

    public function recruteurOffres(Request $request): JsonResponse
    {
        $recruteur = $this->resolveRecruteur($request);

        if (! $recruteur) {
            return response()->json(['data' => []]);
        }

        $query = OffreEmploi::query()
            ->with(['recruteur.utilisateur', 'categorie', 'metier'])
            ->withCount('candidatures')
            ->where('id_recruteur', $recruteur->id_recruteur);

        $this->applySearch($query, $request->get('q'));

        $offres = $query->orderByDesc('date_publication')->get();

        return response()->json([
            'data' => $offres->map(fn ($o) => $this->formatOffre($o)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $recruteur = $this->resolveRecruteur($request);

        if (! $recruteur) {
            return response()->json(['message' => 'Profil recruteur introuvable.'], 403);
        }

        $validated = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:20'],
            'id_categorie' => ['required', 'exists:categories,id_categorie'],
            'id_metier' => ['nullable', 'exists:metiers,id_metier'],
            'nom_metier' => ['nullable', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
            'type_contrat' => ['nullable', 'string', 'max:50'],
            'salaire' => ['nullable', 'numeric', 'min:0'],
            'nombre_postes' => ['nullable', 'integer', 'min:1', 'max:99'],
            'date_expiration' => ['nullable', 'date', 'after_or_equal:today'],
            'image_offre' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,jfif,png,webp', 'max:2048'],
        ]);

        $idMetier = $this->resolveMetierId(
            (int) $validated['id_categorie'],
            $validated['id_metier'] ?? null,
            $validated['nom_metier'] ?? null
        );

        $imageOffre = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('offres', 'public');
            $imageOffre = '/storage/'.$path;
        }

        CandidatureDomainGuard::resolveRecruteurDomainOnPublish($recruteur, (int) $validated['id_categorie']);
        $recruteur->refresh();

        $offre = OffreEmploi::create([
            'id_recruteur' => $recruteur->id_recruteur,
            'id_categorie' => $validated['id_categorie'],
            'id_metier' => $idMetier,
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'ville' => $validated['ville'] ?? $recruteur->ville,
            'type_contrat' => $validated['type_contrat'] ?? 'CDI',
            'salaire' => $validated['salaire'] ?? null,
            'nombre_postes' => $validated['nombre_postes'] ?? 1,
            'date_publication' => now()->toDateString(),
            'date_expiration' => $validated['date_expiration'] ?? now()->addMonths(2)->toDateString(),
            'image_offre' => $imageOffre,
            'statut' => 'active',
            'est_publie' => true,
        ]);

        $offre->load(['recruteur.utilisateur', 'categorie', 'metier'])->loadCount('candidatures');

        $entreprise = $recruteur->nom_entreprise ?? 'Entreprise';
        NotificationService::notifyAdmins(
            'offre',
            'Nouvelle offre publiée',
            "{$entreprise} — {$offre->titre}.",
            '/admin/offres'
        );

        return response()->json([
            'message' => 'Offre publiée avec succès.',
            'data' => $this->formatOffre($offre),
        ], 201);
    }

    public function publish(Request $request, int $id): JsonResponse
    {
        $recruteur = $this->resolveRecruteur($request);
        $offre = OffreEmploi::where('id_recruteur', $recruteur?->id_recruteur)->findOrFail($id);

        $offre->update([
            'est_publie' => true,
            'statut' => 'active',
            'date_publication' => $offre->date_publication ?? now()->toDateString(),
        ]);

        $offre->load(['recruteur.utilisateur', 'categorie', 'metier'])->loadCount('candidatures');

        return response()->json([
            'message' => 'Offre publiée.',
            'data' => $this->formatOffre($offre),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $recruteur = $this->resolveRecruteur($request);
        $offre = OffreEmploi::where('id_recruteur', $recruteur?->id_recruteur)->findOrFail($id);

        $validated = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'min:20'],
            'id_categorie' => ['sometimes', 'exists:categories,id_categorie'],
            'id_metier' => ['nullable', 'exists:metiers,id_metier'],
            'nom_metier' => ['nullable', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
            'type_contrat' => ['nullable', 'string', 'max:50'],
            'salaire' => ['nullable', 'numeric', 'min:0'],
            'nombre_postes' => ['nullable', 'integer', 'min:1', 'max:99'],
            'date_expiration' => ['nullable', 'date'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,jfif,png,webp', 'max:2048'],
        ]);

        if (isset($validated['id_categorie']) || array_key_exists('nom_metier', $validated) || array_key_exists('id_metier', $validated)) {
            $idCategorie = (int) ($validated['id_categorie'] ?? $offre->id_categorie);
            $validated['id_metier'] = $this->resolveMetierId(
                $idCategorie,
                $validated['id_metier'] ?? $offre->id_metier,
                $validated['nom_metier'] ?? null
            );
            unset($validated['nom_metier']);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('offres', 'public');
            $validated['image_offre'] = '/storage/'.$path;
        }

        if (
            $validated === []
            && ! $request->hasFile('image')
            && $request->header('Content-Type')
            && str_contains($request->header('Content-Type'), 'multipart/form-data')
        ) {
            return response()->json([
                'message' => 'Impossible de lire le formulaire. Réessayez ou actualisez la page.',
            ], 422);
        }

        $offre->update($validated);
        $offre->load(['recruteur.utilisateur', 'categorie', 'metier'])->loadCount('candidatures');

        return response()->json([
            'message' => 'Offre mise à jour.',
            'data' => $this->formatOffre($offre),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $recruteur = $this->resolveRecruteur($request);
        $offre = OffreEmploi::where('id_recruteur', $recruteur?->id_recruteur)->findOrFail($id);
        $offre->delete();

        return response()->json(['message' => 'Offre supprimée.']);
    }

    private function resolveRecruteur(Request $request): ?Recruteur
    {
        return Recruteur::where('id_user', $request->user()->id_user)->first();
    }

    private function resolveMetierId(int $idCategorie, ?int $idMetier, ?string $nomMetier): ?int
    {
        if ($idMetier) {
            return $idMetier;
        }

        $nom = trim((string) $nomMetier);
        if ($nom === '') {
            return null;
        }

        $existing = Metier::query()
            ->where('id_categorie', $idCategorie)
            ->whereRaw('LOWER(nom_metier) = ?', [mb_strtolower($nom)])
            ->first();

        if ($existing) {
            return $existing->id_metier;
        }

        return Metier::create([
            'id_categorie' => $idCategorie,
            'nom_metier' => $nom,
        ])->id_metier;
    }

    private function applySearch($query, ?string $q): void
    {
        if (! $q || ! trim($q)) {
            return;
        }

        $term = '%'.trim($q).'%';
        $query->where(function ($builder) use ($term) {
            $builder
                ->where('titre', 'like', $term)
                ->orWhere('description', 'like', $term)
                ->orWhere('ville', 'like', $term)
                ->orWhere('type_contrat', 'like', $term)
                ->orWhereHas('recruteur', function ($r) use ($term) {
                    $r->where('nom_entreprise', 'like', $term);
                })
                ->orWhereHas('categorie', function ($c) use ($term) {
                    $c->where('nom_categorie', 'like', $term);
                })
                ->orWhereHas('metier', function ($m) use ($term) {
                    $m->where('nom_metier', 'like', $term);
                });
        });
    }

    private function formatOffre(OffreEmploi $offre): array
    {
        return [
            'id_offre' => $offre->id_offre,
            'titre' => $offre->titre,
            'description' => $offre->description,
            'ville' => $offre->ville,
            'type_contrat' => $offre->type_contrat,
            'salaire' => $offre->salaire ? number_format((float) $offre->salaire, 0, ',', ' ').' MAD' : 'À discuter',
            'salaire_brut' => $offre->salaire !== null ? (float) $offre->salaire : null,
            'entreprise' => $offre->recruteur?->nom_entreprise ?? 'Entreprise',
            'recruteur_nom' => $offre->recruteur?->nom_entreprise ?? 'Entreprise',
            'recruteur_contact' => $this->formatRecruteurContact($offre),
            'recruteur_prenom' => $offre->recruteur?->utilisateur?->prenom,
            'id_categorie' => $offre->id_categorie,
            'categorie' => $offre->categorie?->nom_categorie,
            'id_metier' => $offre->id_metier,
            'metier' => $offre->metier?->nom_metier,
            'urgence' => $this->resolveUrgence($offre->date_expiration),
            'date_publication' => $offre->date_publication?->format('Y-m-d'),
            'date_limite' => $offre->date_expiration?->format('Y-m-d'),
            'date_limite_label' => $this->formatDateLimite($offre->date_expiration),
            'nombre_postes' => (int) ($offre->nombre_postes ?? 1),
            'nb_candidatures' => (int) ($offre->candidatures_count ?? 0),
            'statut' => $offre->statut,
            'est_publie' => (bool) $offre->est_publie,
            'image' => $this->resolveImage($offre),
        ];
    }

    private function resolveImage(OffreEmploi $offre): string
    {
        return OffreImages::forOffre($offre);
    }

    private function formatRecruteurContact(OffreEmploi $offre): ?string
    {
        $user = $offre->recruteur?->utilisateur;
        if (! $user) {
            return null;
        }

        $name = trim($user->prenom.' '.$user->nom);

        return $name !== '' ? $name : null;
    }

    private function formatDateLimite($date): ?string
    {
        if (! $date) {
            return null;
        }

        $months = [
            1 => 'janvier', 2 => 'février', 3 => 'mars', 4 => 'avril',
            5 => 'mai', 6 => 'juin', 7 => 'juillet', 8 => 'août',
            9 => 'septembre', 10 => 'octobre', 11 => 'novembre', 12 => 'décembre',
        ];

        $day = $date->format('j');
        $month = $months[(int) $date->format('n')] ?? $date->format('m');
        $year = $date->format('Y');

        return "{$day} {$month} {$year}";
    }

    private function resolveUrgence($date): ?string
    {
        if (! $date) {
            return null;
        }

        $daysLeft = now()->startOfDay()->diffInDays($date->copy()->startOfDay(), false);

        if ($daysLeft < 0) {
            return null;
        }

        if ($daysLeft <= 7) {
            return 'Urgent';
        }

        if ($daysLeft <= 21) {
            return 'Prioritaire';
        }

        return null;
    }
}
