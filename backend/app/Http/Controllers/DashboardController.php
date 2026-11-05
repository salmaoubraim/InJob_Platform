<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Message;
use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\Categorie;
use App\Models\Notification;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Support\LandingCatalog;
use App\Support\OffreImages;
use App\Support\CandidatureDomainGuard;
use App\Support\CandidatureNotificationPresenter;
use App\Support\NotificationReadStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        return match ($user->role) {
            'candidat' => response()->json(['data' => $this->candidatStats($user)]),
            'recruteur' => response()->json(['data' => $this->recruteurStats($user)]),
            'admin' => response()->json(['data' => $this->adminStats()]),
            default => response()->json(['data' => []]),
        };
    }

    public function landingStats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'candidats' => Utilisateur::where('role', 'candidat')->count(),
                'recruteurs' => Recruteur::count(),
                'offres_publiees' => OffreEmploi::where('est_publie', true)->count(),
                'candidatures' => Candidature::count(),
                'villes' => OffreEmploi::where('est_publie', true)->distinct('ville')->count('ville'),
                'categories' => Categorie::count(),
            ],
        ]);
    }

    private function candidatStats($user): array
    {
        $candidat = Candidat::where('id_user', $user->id_user)->first();
        $candidatures = $candidat
            ? Candidature::where('id_candidat', $candidat->id_candidat)->get()
            : collect();

        $offresCandidatQuery = OffreEmploi::query()
            ->visibleToCandidat()
            ->whereNotIn('titre', LandingCatalog::TITLES);

        $offresCandidatCount = (clone $offresCandidatQuery)->count();

        $recentOffres = (clone $offresCandidatQuery)
            ->with(['recruteur.utilisateur', 'categorie'])
            ->orderByDesc('date_publication')
            ->limit(3)
            ->get()
            ->map(fn ($o) => [
                'id_offre' => $o->id_offre,
                'titre' => $o->titre,
                'entreprise' => $o->recruteur?->nom_entreprise,
                'recruteur_nom' => $o->recruteur?->nom_entreprise ?? 'Entreprise',
                'recruteur_contact' => $o->recruteur?->utilisateur
                    ? trim($o->recruteur->utilisateur->prenom.' '.$o->recruteur->utilisateur->nom)
                    : null,
                'recruteur_prenom' => $o->recruteur?->utilisateur?->prenom,
                'ville' => $o->ville,
                'categorie' => $o->categorie?->nom_categorie,
                'image' => OffreImages::forOffre($o),
                'nombre_postes' => (int) ($o->nombre_postes ?? 1),
            ]);

        $mesCandidatures = $candidat
            ? Candidature::with(['offre.recruteur.utilisateur'])
                ->where('id_candidat', $candidat->id_candidat)
                ->orderByDesc('date_candidature')
                ->limit(5)
                ->get()
                ->map(fn ($c) => [
                    'id_candidature' => $c->id_candidature,
                    'statut' => $c->statut,
                    'date_candidature' => $c->date_candidature?->format('d/m/Y'),
                    'date_label' => $c->date_candidature?->locale('fr')->diffForHumans(),
                    'offre_titre' => $c->offre?->titre,
                    'recruteur_nom' => $c->offre?->recruteur?->nom_entreprise ?? 'Entreprise',
                    'recruteur_contact' => $c->offre?->recruteur?->utilisateur
                        ? trim($c->offre->recruteur->utilisateur->prenom.' '.$c->offre->recruteur->utilisateur->nom)
                        : null,
                    'ville' => $c->offre?->ville,
                    'image' => $c->offre ? OffreImages::forOffre($c->offre) : null,
                ])
            : collect();

        $messagesNonLus = 0;
        if (Schema::hasColumn('messages', 'lu')) {
            $messagesNonLus = Message::where('destinataire', $user->id_user)
                ->where('lu', false)
                ->count();
        }

        $recentNotifs = Notification::where('id_user', $user->id_user)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($n) {
                $formatted = [
                    'id_notification' => $n->id_notification,
                    'type' => $n->type,
                    'titre' => $n->titre,
                    'message' => Str::limit($n->message, 80),
                    'lu' => NotificationReadStatus::isRead($n),
                    'lien' => $n->lien,
                    'date_label' => $n->created_at?->locale('fr')->diffForHumans(),
                    'candidat_nom' => null,
                    'offre_titre' => null,
                ];

                return CandidatureNotificationPresenter::enrich($formatted, $n);
            });

        return [
            'candidatures_total' => $candidatures->count(),
            'candidatures_en_attente' => $candidatures->where('statut', 'en_attente')->count(),
            'candidatures_acceptees' => $candidatures->where('statut', 'acceptee')->count(),
            'candidatures_refusees' => $candidatures->where('statut', 'refusee')->count(),
            'notifications_non_lues' => NotificationReadStatus::unreadCount($user->id_user),
            'messages_non_lus' => $messagesNonLus,
            'offres_disponibles' => min($offresCandidatCount, 6),
            'offres_accueil_catalogue' => 4,
            'a_cv' => $candidat ? $candidat->cvs()->exists() : false,
            'recent_offres' => $recentOffres,
            'mes_candidatures' => $mesCandidatures,
            'recent_notifications' => $recentNotifs,
        ];
    }

    private function recruteurStats($user): array
    {
        $recruteur = Recruteur::with('categorie')->where('id_user', $user->id_user)->first();
        if (! $recruteur) {
            return [
                'offres_total' => 0,
                'offres_publiees' => 0,
                'offres_actives' => 0,
                'candidatures_recues' => 0,
                'candidatures_en_attente' => 0,
                'candidatures_acceptees' => 0,
                'notifications_non_lues' => NotificationReadStatus::unreadCount($user->id_user),
                'entreprise' => null,
                'id_categorie' => null,
                'domaine' => null,
                'mes_offres' => [],
                'recent_candidatures' => [],
                'messages_non_lus' => 0,
                'avis_recus' => 0,
                'recent_messages' => [],
                'recent_avis' => [],
                'recent_notifications' => [],
            ];
        }

        $recruteur = \App\Support\RecruteurDomainSync::ensureDomain($recruteur);

        $offreIds = OffreEmploi::where('id_recruteur', $recruteur->id_recruteur)->pluck('id_offre');

        $candidatures = Candidature::with(['candidat', 'offre'])
            ->whereIn('id_offre', $offreIds)
            ->get()
            ->filter(function (Candidature $c) use ($recruteur) {
                if (! $c->candidat || ! $c->offre) {
                    return false;
                }

                return CandidatureDomainGuard::isVisibleToRecruteur($recruteur, $c->candidat, $c->offre);
            });

        $mesOffres = OffreEmploi::query()
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->with(['candidatures.candidat'])
            ->orderByDesc('date_publication')
            ->limit(8)
            ->get()
            ->map(function ($o) {
                $count = $o->candidatures
                    ->filter(function ($c) use ($o) {
                        if (! $c->candidat) {
                            return false;
                        }

                        return CandidatureDomainGuard::canApply($c->candidat, $o);
                    })
                    ->count();

                return [
                    'id_offre' => $o->id_offre,
                    'titre' => $o->titre,
                    'candidatures' => $count,
                    'statut' => $o->statut,
                ];
            });

        $recentCandidatures = Candidature::with(['candidat.utilisateur', 'offre'])
            ->whereIn('id_offre', $offreIds)
            ->orderByDesc('date_candidature')
            ->get()
            ->filter(function (Candidature $c) use ($recruteur) {
                if (! $c->candidat || ! $c->offre) {
                    return false;
                }

                return CandidatureDomainGuard::isVisibleToRecruteur($recruteur, $c->candidat, $c->offre);
            })
            ->take(5)
            ->map(fn ($c) => [
                'id_candidature' => $c->id_candidature,
                'candidat' => trim(($c->candidat?->utilisateur?->prenom ?? '').' '.($c->candidat?->utilisateur?->nom ?? '')),
                'offre' => $c->offre?->titre,
                'statut' => $c->statut,
                'date_label' => $c->date_candidature?->locale('fr')->diffForHumans(),
            ])
            ->values();

        $messagesNonLus = 0;
        if (Schema::hasColumn('messages', 'lu')) {
            $messagesNonLus = Message::where('destinataire', $user->id_user)->where('lu', false)->count();
        }

        $avisRecus = Avis::query()
            ->whereIn('id_offre', $offreIds)
            ->whereNotNull('id_offre')
            ->where('id_user', '!=', $user->id_user)
            ->whereHas('utilisateur', fn ($q) => $q->where('role', 'candidat'))
            ->count();

        $recentMessages = Message::with(['expediteurUser'])
            ->where('destinataire', $user->id_user)
            ->orderByDesc('date_envoi')
            ->limit(4)
            ->get()
            ->map(fn ($m) => [
                'id_message' => $m->id_message,
                'expediteur' => trim(($m->expediteurUser?->prenom ?? '').' '.($m->expediteurUser?->nom ?? '')),
                'contenu' => Str::limit($m->contenu, 80),
                'date_label' => $m->date_envoi?->locale('fr')->diffForHumans(),
                'lu' => Schema::hasColumn('messages', 'lu') ? (bool) $m->lu : true,
            ]);

        $recentAvis = Avis::with(['utilisateur', 'offre'])
            ->whereIn('id_offre', $offreIds)
            ->whereNotNull('id_offre')
            ->where('id_user', '!=', $user->id_user)
            ->whereHas('utilisateur', fn ($q) => $q->where('role', 'candidat'))
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(fn ($a) => [
                'id_avis' => $a->id_avis,
                'auteur' => trim(($a->utilisateur?->prenom ?? '').' '.($a->utilisateur?->nom ?? '')),
                'note' => (int) $a->note,
                'commentaire' => Str::limit($a->commentaire, 80),
                'offre' => $a->offre?->titre,
                'date_label' => $a->created_at?->locale('fr')->diffForHumans(),
            ]);

        $recentNotifications = Notification::where('id_user', $user->id_user)
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(function ($n) {
                $formatted = [
                    'id_notification' => $n->id_notification,
                    'titre' => $n->titre,
                    'message' => Str::limit($n->message, 80),
                    'type' => $n->type,
                    'lu' => NotificationReadStatus::isRead($n),
                    'date_label' => $n->created_at?->locale('fr')->diffForHumans(),
                    'lien' => $n->lien,
                    'candidat_nom' => null,
                    'offre_titre' => null,
                ];

                return CandidatureNotificationPresenter::enrich($formatted, $n);
            });

        return [
            'offres_total' => $offreIds->count(),
            'offres_publiees' => OffreEmploi::where('id_recruteur', $recruteur->id_recruteur)->where('est_publie', true)->count(),
            'offres_actives' => OffreEmploi::where('id_recruteur', $recruteur->id_recruteur)
                ->where('est_publie', true)
                ->publishedActive()
                ->count(),
            'candidatures_recues' => $candidatures->count(),
            'candidatures_en_attente' => $candidatures->where('statut', 'en_attente')->count(),
            'candidatures_acceptees' => $candidatures->where('statut', 'acceptee')->count(),
            'notifications_non_lues' => NotificationReadStatus::unreadCount($user->id_user),
            'messages_non_lus' => $messagesNonLus,
            'avis_recus' => $avisRecus,
            'entreprise' => $recruteur->nom_entreprise,
            'id_categorie' => $recruteur->id_categorie,
            'domaine' => $recruteur->categorie?->nom_categorie,
            'mes_offres' => $mesOffres,
            'recent_candidatures' => $recentCandidatures,
            'recent_messages' => $recentMessages,
            'recent_avis' => $recentAvis,
            'recent_notifications' => $recentNotifications,
        ];
    }

    private function adminStats(): array
    {
        $candidaturesParMois = [];
        for ($i = 5; $i >= 0; $i--) {
            $debut = now()->subMonths($i)->startOfMonth();
            $fin = now()->subMonths($i)->endOfMonth();
            $candidaturesParMois[] = [
                'period' => $debut->format('Y-m'),
                'label' => $debut->locale('fr')->translatedFormat('M Y'),
                'count' => Candidature::whereBetween('date_candidature', [$debut, $fin])->count(),
            ];
        }

        $offresParCategorie = OffreEmploi::query()
            ->join('categories', 'offres_emploi.id_categorie', '=', 'categories.id_categorie')
            ->where('offres_emploi.est_publie', true)
            ->select('categories.nom_categorie as label', DB::raw('COUNT(*) as count'))
            ->groupBy('categories.nom_categorie')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn ($r) => ['label' => $r->label, 'count' => (int) $r->count]);

        $activites = collect();

        Candidature::with(['candidat.utilisateur', 'offre'])
            ->orderByDesc('date_candidature')
            ->limit(4)
            ->get()
            ->each(function ($c) use ($activites) {
                $nom = trim(($c->candidat?->utilisateur?->prenom ?? '').' '.($c->candidat?->utilisateur?->nom ?? ''));
                $activites->push([
                    'type' => 'candidature',
                    'label' => "{$nom} a postulé à « {$c->offre?->titre} »",
                    'date_label' => $c->date_candidature?->locale('fr')->diffForHumans(),
                    'date_sort' => $c->date_candidature?->timestamp ?? 0,
                ]);
            });

        Message::with('expediteurUser')->orderByDesc('date_envoi')->limit(3)->get()->each(function ($m) use ($activites) {
            $exp = $m->expediteurUser;
            $nom = $exp ? trim($exp->prenom.' '.$exp->nom) : 'Utilisateur';
            $activites->push([
                'type' => 'message',
                'label' => "Message de {$nom}",
                'date_label' => $m->date_envoi?->locale('fr')->diffForHumans(),
                'date_sort' => $m->date_envoi?->timestamp ?? 0,
            ]);
        });

        Avis::orderByDesc('created_at')->limit(2)->get()->each(function ($a) use ($activites) {
            $activites->push([
                'type' => 'avis',
                'label' => 'Nouvel avis — note '.$a->note.'/5',
                'date_label' => $a->created_at?->locale('fr')->diffForHumans(),
                'date_sort' => $a->created_at?->timestamp ?? 0,
            ]);
        });

        $activitesRecentes = $activites
            ->sortByDesc('date_sort')
            ->take(8)
            ->values()
            ->map(fn ($a) => [
                'type' => $a['type'],
                'label' => $a['label'],
                'date_label' => $a['date_label'],
            ]);

        $utilisateursActifs = Utilisateur::whereIn('role', ['candidat', 'recruteur'])->count();

        $candidaturesRecentesTable = Candidature::with(['offre.recruteur', 'candidat.utilisateur'])
            ->orderByDesc('date_candidature')
            ->limit(5)
            ->get()
            ->map(fn ($c) => [
                'candidat' => $c->candidat?->utilisateur
                    ? trim($c->candidat->utilisateur->prenom.' '.$c->candidat->utilisateur->nom)
                    : 'Candidat',
                'offre' => $c->offre?->titre ?? '—',
                'recruteur' => $c->offre?->recruteur?->nom_entreprise ?? '—',
                'date' => $c->date_candidature?->format('d/m/Y') ?? '—',
                'statut' => $c->statut,
            ]);

        $inscriptionsRecentes = Recruteur::with('utilisateur')
            ->get()
            ->sortByDesc(fn ($r) => $r->utilisateur?->created_at?->timestamp ?? 0)
            ->take(5)
            ->map(function ($r) {
                $user = $r->utilisateur;

                return [
                    'nom' => $r->nom_entreprise ?: trim(($user?->prenom ?? '').' '.($user?->nom ?? '')),
                    'date' => $user?->created_at?->format('d/m/Y') ?? '—',
                    'statut' => 'Actif',
                    'user' => \App\Support\UserPresenter::avatarFields($user),
                ];
            })
            ->values();

        return [
            'utilisateurs' => Utilisateur::count(),
            'candidats' => Utilisateur::where('role', 'candidat')->count(),
            'recruteurs' => Recruteur::count(),
            'offres_actives' => OffreEmploi::publishedActive()->count(),
            'candidatures' => Candidature::count(),
            'categories' => Categorie::count(),
            'avis' => Avis::count(),
            'messages' => Message::count(),
            'offres_expirees' => OffreEmploi::query()
                ->where('est_publie', true)
                ->whereNotNull('date_expiration')
                ->where('date_expiration', '<', now()->toDateString())
                ->count(),
            'note_moyenne' => ($avg = Avis::avg('note')) !== null ? round((float) $avg, 1) : null,
            'utilisateurs_actifs' => $utilisateursActifs,
            'candidatures_par_mois' => $candidaturesParMois,
            'offres_par_categorie' => $offresParCategorie,
            'activites_recentes' => $activitesRecentes,
            'candidatures_recentes_table' => $candidaturesRecentesTable,
            'inscriptions_recentes' => $inscriptionsRecentes,
        ];
    }
}
