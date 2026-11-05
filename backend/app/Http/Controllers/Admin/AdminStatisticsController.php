<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\AvisRecruteur;
use App\Models\AvisRecruteurCandidat;
use App\Models\Candidature;
use App\Models\Message;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminStatisticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $start = microtime(true);
        $dbConnected = $this->pingDatabase();
        $responseMs = (int) round((microtime(true) - $start) * 1000);

        return response()->json([
            'data' => [
                'cards' => $this->buildCards(),
                'charts' => $this->buildCharts(),
                'system' => $this->buildSystemHealth($dbConnected, $responseMs),
            ],
        ]);
    }

    private function buildCards(): array
    {
        $avisCount = $this->totalAvisCount();
        $noteMoyenne = $this->averageRating();

        return [
            'utilisateurs' => Utilisateur::count(),
            'candidats' => Utilisateur::where('role', 'candidat')->count(),
            'recruteurs' => Recruteur::count(),
            'offres_actives' => OffreEmploi::visibleToCandidat()->count(),
            'offres_expirees' => OffreEmploi::query()
                ->where('est_publie', true)
                ->whereNotNull('date_expiration')
                ->where('date_expiration', '<', now()->toDateString())
                ->count(),
            'candidatures' => Candidature::count(),
            'messages' => Schema::hasTable('messages') ? Message::count() : 0,
            'avis' => $avisCount,
            'note_moyenne' => $noteMoyenne,
        ];
    }

    private function buildCharts(): array
    {
        return [
            'candidatures_par_mois' => $this->monthlySeries(
                fn (Carbon $start, Carbon $end) => Candidature::whereBetween('date_candidature', [$start, $end])->count()
            ),
            'offres_par_categorie' => OffreEmploi::query()
                ->join('categories', 'offres_emploi.id_categorie', '=', 'categories.id_categorie')
                ->where('offres_emploi.est_publie', true)
                ->select('categories.nom_categorie as label', DB::raw('COUNT(*) as count'))
                ->groupBy('categories.nom_categorie', 'categories.id_categorie')
                ->orderByDesc('count')
                ->limit(10)
                ->get()
                ->map(fn ($r) => ['label' => $r->label, 'count' => (int) $r->count])
                ->values()
                ->all(),
            'inscriptions_par_mois' => [
                'candidats' => $this->monthlySeries(
                    fn (Carbon $start, Carbon $end) => $this->countUserRegistrations('candidat', $start, $end)
                ),
                'recruteurs' => $this->monthlySeries(
                    fn (Carbon $start, Carbon $end) => $this->countUserRegistrations('recruteur', $start, $end)
                ),
            ],
            'offres_par_mois' => $this->monthlySeries(
                fn (Carbon $start, Carbon $end) => OffreEmploi::query()
                    ->where('est_publie', true)
                    ->whereBetween('date_publication', [$start->toDateString(), $end->toDateString()])
                    ->count()
            ),
        ];
    }

    private function monthlySeries(callable $counter, int $months = 12): array
    {
        $data = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $start = now()->subMonths($i)->startOfMonth();
            $end = now()->subMonths($i)->endOfMonth();
            $data[] = [
                'period' => $start->format('Y-m'),
                'count' => (int) $counter($start, $end),
            ];
        }

        return $data;
    }

    private function countUserRegistrations(string $role, Carbon $start, Carbon $end): int
    {
        if (! Schema::hasColumn('utilisateurs', 'created_at')) {
            return 0;
        }

        return Utilisateur::where('role', $role)
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    private function totalAvisCount(): int
    {
        $total = 0;
        if (Schema::hasTable('avis')) {
            $q = Avis::query();
            if (Schema::hasColumn('avis', 'est_masque')) {
                $q->where('est_masque', false);
            }
            $total += $q->count();
        }
        if (Schema::hasTable('avis_recruteurs')) {
            $q = AvisRecruteur::query();
            if (Schema::hasColumn('avis_recruteurs', 'est_masque')) {
                $q->where('est_masque', false);
            }
            $total += $q->count();
        }
        if (Schema::hasTable('avis_recruteur_candidat')) {
            $q = AvisRecruteurCandidat::query();
            if (Schema::hasColumn('avis_recruteur_candidat', 'est_masque')) {
                $q->where('est_masque', false);
            }
            $total += $q->count();
        }

        return $total;
    }

    private function averageRating(): ?float
    {
        $notes = collect();

        if (Schema::hasTable('avis')) {
            $q = Avis::query();
            if (Schema::hasColumn('avis', 'est_masque')) {
                $q->where('est_masque', false);
            }
            $avg = $q->avg('note');
            if ($avg !== null) {
                $notes->push((float) $avg);
            }
        }
        if (Schema::hasTable('avis_recruteurs')) {
            $q = AvisRecruteur::query();
            if (Schema::hasColumn('avis_recruteurs', 'est_masque')) {
                $q->where('est_masque', false);
            }
            $avg = $q->avg('note');
            if ($avg !== null) {
                $notes->push((float) $avg);
            }
        }
        if (Schema::hasTable('avis_recruteur_candidat')) {
            $q = AvisRecruteurCandidat::query();
            if (Schema::hasColumn('avis_recruteur_candidat', 'est_masque')) {
                $q->where('est_masque', false);
            }
            $avg = $q->avg('note');
            if ($avg !== null) {
                $notes->push((float) $avg);
            }
        }

        if ($notes->isEmpty()) {
            return null;
        }

        return round($notes->avg(), 1);
    }

    private function buildSystemHealth(bool $dbConnected, int $responseMs): array
    {
        $sessions = null;
        if (Schema::hasTable('personal_access_tokens')) {
            $sessions = DB::table('personal_access_tokens')
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->count();
        }

        return [
            'database_connected' => $dbConnected,
            'response_time_ms' => $responseMs,
            'active_sessions' => $sessions,
            'server_status' => $dbConnected ? 'online' : 'offline',
            'uptime' => null,
            'uptime_available' => false,
        ];
    }

    private function pingDatabase(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
