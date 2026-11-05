<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminModerationLog;
use App\Models\Avis;
use App\Models\AvisRecruteur;
use App\Models\AvisRecruteurCandidat;
use App\Models\Candidature;
use App\Models\Categorie;
use App\Models\Metier;
use App\Models\OffreEmploi;
use App\Models\Utilisateur;
use App\Services\NotificationService;
use App\Support\UserPresenter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Accès réservé aux administrateurs.'], 403);
        }

        return null;
    }

    // ─── Utilisateurs ───────────────────────────────────────────

    public function utilisateurs(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $q = Utilisateur::with(['candidat', 'recruteur']);
        if ($search = trim((string) $request->query('q', ''))) {
            $q->where(function ($b) use ($search) {
                $b->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }
        if ($role = $request->query('role')) {
            $q->where('role', $role);
        }

        $paginated = $q->orderByDesc('id_user')->paginate(min(50, (int) $request->query('per_page', 20)));

        return response()->json([
            'data' => collect($paginated->items())->map(fn ($u) => $this->formatUser($u)),
            'meta' => ['current_page' => $paginated->currentPage(), 'last_page' => $paginated->lastPage(), 'total' => $paginated->total()],
        ]);
    }

    public function showUser(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $user = Utilisateur::with([
            'candidat.cvs',
            'candidat.candidatures.offre',
            'recruteur.offres',
        ])->findOrFail($id);

        $cvs = [];
        if ($user->candidat) {
            $cvs = $user->candidat->cvs->map(fn ($cv) => [
                'id_cv' => $cv->id_cv,
                'nom_fichier' => $cv->nom_fichier ?? null,
            ])->values()->all();
        }

        $candidatures = [];
        if ($user->candidat) {
            $candidatures = $user->candidat->candidatures
                ->sortByDesc('date_candidature')
                ->take(20)
                ->map(fn ($c) => [
                    'id_candidature' => $c->id_candidature,
                    'offre' => $c->offre?->titre ?? '—',
                    'statut' => $c->statut,
                    'date_candidature' => $c->date_candidature?->format('d/m/Y') ?? '—',
                ])
                ->values()
                ->all();
        }

        $offres = [];
        if ($user->recruteur) {
            $offres = $user->recruteur->offres
                ->sortByDesc('date_publication')
                ->take(20)
                ->map(fn ($o) => [
                    'id_offre' => $o->id_offre,
                    'titre' => $o->titre,
                    'statut_badge' => $this->offreBadge($o),
                    'date_publication' => $o->date_publication?->format('d/m/Y') ?? '—',
                    'nb_candidatures' => $o->candidatures()->count(),
                ])
                ->values()
                ->all();
        }

        $historique = $this->moderationHistoryFor($user->id_user);

        return response()->json([
            'data' => array_merge($this->formatUser($user), [
                'photo_profil' => $user->photo_profil,
                'photo_url' => UserPresenter::photoUrl($user->photo_profil),
                'cvs' => $cvs,
                'candidatures' => $candidatures,
                'offres' => $offres,
                'historique_moderation' => $historique,
            ]),
        ]);
    }

    public function suspendUser(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $user = Utilisateur::findOrFail($id);
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de bloquer un administrateur.'], 422);
        }
        $user->update(['est_actif' => false]);
        $this->logModeration($request, $user->id_user, 'block', 'Compte bloqué par l\'administration.');
        NotificationService::send($user->id_user, 'compte', 'Compte bloqué', 'Votre compte a été bloqué par l\'administration. Contactez-nous via la page Contact.', '/contact');

        return response()->json(['message' => 'Compte bloqué.', 'data' => $this->formatUser($user->fresh())]);
    }

    public function activateUser(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $user = Utilisateur::findOrFail($id);
        $user->update(['est_actif' => true]);
        $this->logModeration($request, $user->id_user, 'unblock', 'Compte débloqué par l\'administration.');

        return response()->json(['message' => 'Compte débloqué.', 'data' => $this->formatUser($user->fresh())]);
    }

    public function warnUser(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $validated = $request->validate(['message' => ['required', 'string', 'max:1000']]);
        $user = Utilisateur::findOrFail($id);
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Action non autorisée.'], 422);
        }
        $this->logModeration($request, $user->id_user, 'warning', $validated['message']);
        NotificationService::send($user->id_user, 'avertissement', 'Avertissement InJob', $validated['message'], '/');

        return response()->json(['message' => 'Avertissement envoyé.']);
    }

    public function destroyUser(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $user = Utilisateur::findOrFail($id);
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un administrateur.'], 422);
        }
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    // ─── Offres ───────────────────────────────────────────────

    public function offres(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $q = OffreEmploi::with(['recruteur.utilisateur', 'categorie'])->withCount('candidatures');

        if ($search = trim((string) $request->query('q', ''))) {
            $q->where(function ($b) use ($search) {
                $b->where('titre', 'like', "%{$search}%")
                    ->orWhere('ville', 'like', "%{$search}%")
                    ->orWhereHas('recruteur', fn ($r) => $r->where('nom_entreprise', 'like', "%{$search}%"));
            });
        }
        if ($cat = $request->query('id_categorie')) {
            $q->where('id_categorie', $cat);
        }
        if ($statut = $request->query('statut_offre')) {
            match ($statut) {
                'active' => $q->where('est_publie', true)->where('est_masquee', false)
                    ->where(fn ($b) => $b->whereNull('statut')->orWhereRaw('LOWER(statut) IN (?,?,?,?,?)', ['active', 'actif', 'publie', 'publiée', 'publiee'])),
                'suspendue' => $q->whereRaw('LOWER(statut) = ?', ['suspendue']),
                'expiree' => $q->whereNotNull('date_expiration')->where('date_expiration', '<', now()->toDateString()),
                'masquee' => $q->where('est_masquee', true),
                'brouillon' => $q->where('est_publie', false),
                default => null,
            };
        }

        $paginated = $q->orderByDesc('date_publication')->paginate(min(50, (int) $request->query('per_page', 20)));

        return response()->json([
            'data' => collect($paginated->items())->map(fn ($o) => $this->formatOffre($o)),
            'meta' => ['current_page' => $paginated->currentPage(), 'last_page' => $paginated->lastPage(), 'total' => $paginated->total()],
        ]);
    }

    public function showOffre(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $offre = OffreEmploi::with(['recruteur.utilisateur', 'categorie', 'metier'])->withCount('candidatures')->findOrFail($id);

        return response()->json(['data' => $this->formatOffre($offre, true)]);
    }

    public function suspendOffre(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $offre = OffreEmploi::findOrFail($id);
        $offre->update(['statut' => 'suspendue', 'est_publie' => false]);

        return response()->json(['message' => 'Offre suspendue.', 'data' => $this->formatOffre($offre->fresh())]);
    }

    public function hideOffre(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $offre = OffreEmploi::findOrFail($id);
        $offre->update(['est_masquee' => true, 'est_publie' => false]);

        return response()->json(['message' => 'Offre masquée.', 'data' => $this->formatOffre($offre->fresh())]);
    }

    public function unhideOffre(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $offre = OffreEmploi::findOrFail($id);
        $offre->update([
            'est_masquee' => false,
            'est_publie' => true,
            'statut' => $offre->statut === 'suspendue' ? 'active' : $offre->statut,
        ]);

        return response()->json(['message' => 'Offre démasquée.', 'data' => $this->formatOffre($offre->fresh())]);
    }

    public function destroyOffre(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        OffreEmploi::findOrFail($id)->delete();

        return response()->json(['message' => 'Offre supprimée.']);
    }

    // ─── Candidatures ─────────────────────────────────────────

    public function candidatures(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $q = Candidature::with(['offre.recruteur.utilisateur', 'candidat.utilisateur', 'candidat.cvs']);

        if ($search = trim((string) $request->query('q', ''))) {
            $q->where(function ($b) use ($search) {
                $b->whereHas('offre', fn ($o) => $o->where('titre', 'like', "%{$search}%"))
                    ->orWhereHas('candidat.utilisateur', fn ($u) => $u
                        ->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%"));
            });
        }
        if ($statut = $request->query('statut')) {
            $q->where('statut', $statut);
        }

        $paginated = $q->orderByDesc('date_candidature')->paginate(min(50, (int) $request->query('per_page', 20)));

        return response()->json([
            'data' => collect($paginated->items())->map(fn ($c) => $this->formatCandidature($c)),
            'meta' => ['current_page' => $paginated->currentPage(), 'last_page' => $paginated->lastPage(), 'total' => $paginated->total()],
        ]);
    }

    public function destroyCandidature(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        Candidature::findOrFail($id)->delete();

        return response()->json(['message' => 'Candidature supprimée.']);
    }

    // ─── Catégories & métiers ─────────────────────────────────

    public function categories(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $search = trim((string) $request->query('q', ''));
        $q = Categorie::withCount('offres');
        if ($search !== '') {
            $q->where('nom_categorie', 'like', "%{$search}%");
        }

        return response()->json([
            'data' => $q->orderBy('nom_categorie')->get()->map(fn ($c) => [
                'id_categorie' => $c->id_categorie,
                'nom_categorie' => $c->nom_categorie,
                'description' => $c->description,
                'nb_offres' => $c->offres_count ?? 0,
            ]),
        ]);
    }

    public function storeCategorie(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $validated = $request->validate([
            'nom_categorie' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);
        $cat = Categorie::create($validated);

        return response()->json(['message' => 'Catégorie créée.', 'data' => $cat], 201);
    }

    public function updateCategorie(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $cat = Categorie::findOrFail($id);
        $validated = $request->validate([
            'nom_categorie' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);
        $cat->update($validated);

        return response()->json(['message' => 'Catégorie mise à jour.', 'data' => $cat]);
    }

    public function destroyCategorie(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $cat = Categorie::withCount('offres')->findOrFail($id);
        if ($cat->offres_count > 0) {
            return response()->json(['message' => 'Impossible : des offres utilisent cette catégorie.'], 422);
        }
        $cat->delete();

        return response()->json(['message' => 'Catégorie supprimée.']);
    }

    public function metiers(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $search = trim((string) $request->query('q', ''));
        $q = Metier::with('categorie')->withCount('offres');
        if ($search !== '') {
            $q->where('nom_metier', 'like', "%{$search}%");
        }

        return response()->json([
            'data' => $q->orderBy('nom_metier')->get()->map(fn ($m) => [
                'id_metier' => $m->id_metier,
                'nom_metier' => $m->nom_metier,
                'id_categorie' => $m->id_categorie,
                'categorie' => $m->categorie?->nom_categorie,
                'nb_offres' => $m->offres_count ?? 0,
            ]),
        ]);
    }

    public function storeMetier(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $validated = $request->validate([
            'nom_metier' => ['required', 'string', 'max:255'],
            'id_categorie' => ['required', 'integer', 'exists:categories,id_categorie'],
            'description' => ['nullable', 'string', 'max:2000'],
        ], [
            'nom_metier.required' => 'Le nom du métier est obligatoire.',
            'id_categorie.required' => 'La catégorie est obligatoire.',
        ]);

        $metier = Metier::create($validated);

        return response()->json(['message' => 'Métier créé.', 'data' => $metier], 201);
    }

    public function updateMetier(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $metier = Metier::findOrFail($id);
        $validated = $request->validate([
            'nom_metier' => ['sometimes', 'string', 'max:255'],
            'id_categorie' => ['sometimes', 'integer', 'exists:categories,id_categorie'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);
        $metier->update($validated);

        return response()->json(['message' => 'Métier mis à jour.', 'data' => $metier]);
    }

    public function destroyMetier(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $metier = Metier::withCount('offres')->findOrFail($id);
        if ($metier->offres_count > 0) {
            return response()->json(['message' => 'Impossible : des offres utilisent ce métier.'], 422);
        }
        $metier->delete();

        return response()->json(['message' => 'Métier supprimé.']);
    }

    // ─── Avis modération ──────────────────────────────────────

    public function avis(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $search = trim((string) $request->query('q', ''));
        $type = $request->query('type');
        $sentiment = $request->query('sentiment');
        $items = collect();

        if (! $type || $type === 'candidat_recruteur') {
            $q = AvisRecruteur::with(['candidat.utilisateur', 'recruteur.utilisateur', 'offre']);
            if ($search) {
                $q->where('commentaire', 'like', "%{$search}%");
            }
            $items = $items->merge($q->limit(100)->get()->map(fn ($a) => $this->formatAvisItem($a, 'candidat_recruteur')));
        }

        if (! $type || $type === 'recruteur_candidat') {
            $q = AvisRecruteurCandidat::with(['recruteur.utilisateur', 'candidat.utilisateur', 'offre']);
            if ($search) {
                $q->where('commentaire', 'like', "%{$search}%");
            }
            $items = $items->merge($q->limit(100)->get()->map(fn ($a) => $this->formatAvisItem($a, 'recruteur_candidat')));
        }

        if (! $type || $type === 'plateforme') {
            $q = Avis::with(['utilisateur']);
            if ($search) {
                $q->where('commentaire', 'like', "%{$search}%");
            }
            $items = $items->merge($q->limit(100)->get()->map(fn ($a) => $this->formatAvisItem($a, 'plateforme')));
        }

        if ($sentiment) {
            $items = $items->filter(fn ($a) => $a['sentiment'] === $sentiment);
        }

        return response()->json(['data' => $items->sortByDesc('created_at')->values()]);
    }

    public function hideAvis(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $validated = $request->validate([
            'type' => ['required', 'in:candidat_recruteur,recruteur_candidat,plateforme'],
            'id' => ['required', 'integer'],
        ]);
        $avis = $this->findAvisByType($validated['type'], $validated['id']);
        $avis->forceFill(['est_masque' => true])->save();

        return response()->json(['message' => 'Avis masqué sur toute la plateforme.']);
    }

    public function unhideAvis(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $validated = $request->validate([
            'type' => ['required', 'in:candidat_recruteur,recruteur_candidat,plateforme'],
            'id' => ['required', 'integer'],
        ]);
        $avis = $this->findAvisByType($validated['type'], $validated['id']);
        $avis->forceFill(['est_masque' => false])->save();

        return response()->json(['message' => 'Avis démasqué sur toute la plateforme.']);
    }

    public function destroyAllAvis(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        if (! $request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        if (! $request->boolean('confirm')) {
            return response()->json(['message' => 'Confirmation requise.'], 422);
        }

        $count = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('avis_recruteurs')) {
            $count += AvisRecruteur::query()->delete();
        }
        if (\Illuminate\Support\Facades\Schema::hasTable('avis_recruteur_candidat')) {
            $count += AvisRecruteurCandidat::query()->delete();
        }
        if (\Illuminate\Support\Facades\Schema::hasTable('avis')) {
            $count += Avis::query()->delete();
        }

        return response()->json(['message' => "{$count} avis supprimés.", 'count' => $count]);
    }

    public function destroyAvis(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $validated = $request->validate([
            'type' => ['required', 'in:candidat_recruteur,recruteur_candidat,plateforme'],
            'id' => ['required', 'integer'],
        ]);
        $this->findAvisByType($validated['type'], $validated['id'])->delete();

        return response()->json(['message' => 'Avis supprimé définitivement.']);
    }

    public function signalAvis(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $validated = $request->validate([
            'type' => ['required', 'in:candidat_recruteur,recruteur_candidat,plateforme'],
            'id' => ['required', 'integer'],
        ]);
        $this->findAvisByType($validated['type'], $validated['id'])->update(['est_signale' => true]);

        return response()->json(['message' => 'Avis marqué comme signalé.']);
    }

    // ─── Helpers ──────────────────────────────────────────────

    private function formatUser(Utilisateur $u): array
    {
        $active = (bool) ($u->est_actif ?? true);

        return [
            'id_user' => $u->id_user,
            'nom' => $u->nom,
            'prenom' => $u->prenom,
            'email' => $u->email,
            'telephone' => $u->telephone,
            'role' => $u->role,
            'photo_profil' => $u->photo_profil,
            'photo_url' => UserPresenter::photoUrl($u->photo_profil),
            'est_actif' => $active,
            'statut_compte' => $active ? 'active' : 'blocked',
            'ville' => $u->candidat?->ville ?? $u->recruteur?->ville,
            'entreprise' => $u->recruteur?->nom_entreprise,
            'created_at' => $u->created_at?->format('d M Y'),
        ];
    }

    private function logModeration(Request $request, int $userId, string $action, ?string $message = null): void
    {
        if (! Schema::hasTable('admin_moderation_logs')) {
            return;
        }

        AdminModerationLog::create([
            'id_user' => $userId,
            'id_admin' => $request->user()?->id_user,
            'action' => $action,
            'message' => $message,
        ]);
    }

    private function moderationHistoryFor(int $userId): array
    {
        if (! Schema::hasTable('admin_moderation_logs')) {
            return [];
        }

        return AdminModerationLog::with('admin')
            ->where('id_user', $userId)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'message' => $log->message,
                'admin' => $log->admin
                    ? trim($log->admin->prenom.' '.$log->admin->nom)
                    : null,
                'date_label' => $log->created_at?->locale('fr')->diffForHumans(),
                'created_at' => $log->created_at?->format('d/m/Y H:i'),
            ])
            ->values()
            ->all();
    }

    private function formatOffre(OffreEmploi $o, bool $detail = false): array
    {
        $badge = $this->offreBadge($o);
        $recruteurUser = $o->recruteur?->utilisateur;
        $data = [
            'id_offre' => $o->id_offre,
            'titre' => $o->titre,
            'entreprise' => $o->recruteur?->nom_entreprise,
            'recruteur_user' => UserPresenter::avatarFields($recruteurUser),
            'ville' => $o->ville,
            'categorie' => $o->categorie?->nom_categorie,
            'id_categorie' => $o->id_categorie,
            'est_publie' => (bool) $o->est_publie,
            'est_masquee' => (bool) ($o->est_masquee ?? false),
            'statut' => $o->statut,
            'statut_badge' => $badge,
            'nb_candidatures' => $o->candidatures_count ?? $o->candidatures()->count(),
            'date_publication' => $o->date_publication?->format('d/m/Y'),
            'date_expiration' => $o->date_expiration?->format('d/m/Y'),
        ];
        if ($detail) {
            $data['description'] = $o->description;
            $data['metier'] = $o->metier?->nom_metier;
            $data['recruteur_email'] = $o->recruteur?->utilisateur?->email;
        }

        return $data;
    }

    private function offreBadge(OffreEmploi $o): string
    {
        if ($o->est_masquee ?? false) {
            return 'masquee';
        }
        if (strtolower((string) $o->statut) === 'suspendue') {
            return 'suspendue';
        }
        if ($o->date_expiration && $o->date_expiration->format('Y-m-d') < now()->format('Y-m-d')) {
            return 'expiree';
        }
        if ($o->est_publie) {
            return 'active';
        }

        return 'brouillon';
    }

    private function formatCandidature(Candidature $c): array
    {
        $cv = $c->candidat?->cvs?->first();
        $candidatUser = $c->candidat?->utilisateur;
        $recruteurUser = $c->offre?->recruteur?->utilisateur;

        return [
            'id_candidature' => $c->id_candidature,
            'statut' => $c->statut,
            'offre' => $c->offre?->titre,
            'id_offre' => $c->id_offre,
            'entreprise' => $c->offre?->recruteur?->nom_entreprise,
            'recruteur' => $c->offre?->recruteur?->nom_entreprise,
            'candidat' => $candidatUser
                ? trim($candidatUser->prenom.' '.$candidatUser->nom)
                : null,
            'candidat_user' => UserPresenter::avatarFields($candidatUser),
            'recruteur_user' => UserPresenter::avatarFields($recruteurUser),
            'candidat_email' => $candidatUser?->email,
            'id_cv' => $cv?->id_cv,
            'date_label' => $c->date_candidature?->locale('fr')->diffForHumans(),
            'date_candidature' => $c->date_candidature?->format('d/m/Y'),
        ];
    }

    private function formatAvisItem($a, string $type): array
    {
        $note = (int) ($a->note ?? 0);
        $sentiment = $note >= 4 ? 'positif' : ($note === 3 ? 'neutre' : 'negatif');

        $auteur = null;
        $auteurUser = null;
        $cible = null;
        $offre = $a->offre?->titre ?? null;

        if ($type === 'candidat_recruteur') {
            $auteurUser = $a->candidat?->utilisateur;
            $auteur = $auteurUser
                ? trim($auteurUser->prenom.' '.$auteurUser->nom)
                : 'Candidat';
            $cible = $a->recruteur?->nom_entreprise ?? 'Recruteur';
        } elseif ($type === 'recruteur_candidat') {
            $auteurUser = $a->recruteur?->utilisateur;
            $auteur = $a->recruteur?->nom_entreprise
                ?? ($auteurUser ? trim($auteurUser->prenom.' '.$auteurUser->nom) : 'Recruteur');
            $cible = $a->candidat?->utilisateur
                ? trim($a->candidat->utilisateur->prenom.' '.$a->candidat->utilisateur->nom)
                : 'Candidat';
        } else {
            $auteurUser = $a->utilisateur;
            $auteur = $auteurUser
                ? trim($auteurUser->prenom.' '.$auteurUser->nom)
                : ($a->nom ?? 'Utilisateur');
            $cible = 'Plateforme InJob';
        }

        return [
            'id' => $a->getKey(),
            'type' => $type,
            'auteur' => $auteur,
            'auteur_user' => UserPresenter::avatarFields($auteurUser),
            'cible' => $cible,
            'offre_titre' => $offre,
            'note' => $note,
            'sentiment' => $sentiment,
            'commentaire' => $a->commentaire,
            'est_masque' => (bool) ($a->est_masque ?? false),
            'est_signale' => (bool) ($a->est_signale ?? false),
            'created_at' => $a->created_at?->toIso8601String(),
            'date_label' => $a->created_at?->locale('fr')->diffForHumans(),
        ];
    }

    private function findAvisByType(string $type, int $id)
    {
        return match ($type) {
            'candidat_recruteur' => AvisRecruteur::findOrFail($id),
            'recruteur_candidat' => AvisRecruteurCandidat::findOrFail($id),
            default => Avis::findOrFail($id),
        };
    }
}
