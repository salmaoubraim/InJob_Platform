import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Bell,
  Clock,
  MessageSquare,
  Star,
  CheckCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import PageShell from '../../components/ui/PageShell';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { getCandidatureStatut } from '../../utils/candidatureStatus';
import { fetchDashboardStats } from '../../services/dashboardService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { useAuth } from '../../context/AuthContext';

const EMPTY_STATS = {
  offres_publiees: 0,
  offres_actives: 0,
  candidatures_recues: 0,
  candidatures_en_attente: 0,
  candidatures_acceptees: 0,
  notifications_non_lues: 0,
  messages_non_lus: 0,
  avis_recus: 0,
  entreprise: null,
  mes_offres: [],
  recent_candidatures: [],
  recent_messages: [],
  recent_avis: [],
  recent_notifications: [],
};

export default function RecruteurDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) setStats({ ...EMPTY_STATS, ...data });
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Impossible de charger le tableau de bord.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id_user]);

  const prenom = user?.prenom || 'Bienvenue';
  const entreprise = stats.entreprise || user?.recruteur?.nom_entreprise;
  const applicationsReceivedLabel =
    stats.candidatures_recues <= 1
      ? `${stats.candidatures_recues} candidature reçue`
      : `${stats.candidatures_recues} candidatures reçues`;
  const activeOffersLabel =
    stats.offres_actives <= 1
      ? `${stats.offres_actives} active`
      : `${stats.offres_actives} actives`;

  return (
    <PageShell title="Tableau de bord" subtitle="Vue d'ensemble de votre activité.">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-error text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          Chargement…
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark text-white p-6 sm:p-8 shadow-lg shadow-primary/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Bienvenue</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-1">{prenom}</h2>
                {entreprise && (
                  <p className="text-white/90 mt-2 text-sm sm:text-base">{entreprise}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm bg-white/10 rounded-xl px-4 py-2">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>{applicationsReceivedLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4">
            <StatCard
              label="Offres publiées"
              value={stats.offres_publiees}
              trend={activeOffersLabel}
              icon={Briefcase}
              to="/recruteur/offres"
            />
            <StatCard
              label="Candidatures"
              value={stats.candidatures_recues}
              trend={`${stats.candidatures_en_attente} en attente`}
              icon={Users}
              to="/recruteur/candidatures"
            />
            <StatCard
              label="En attente"
              value={stats.candidatures_en_attente}
              trend={
                stats.candidatures_acceptees <= 1
                  ? `${stats.candidatures_acceptees} acceptée`
                  : `${stats.candidatures_acceptees} acceptées`
              }
              icon={Clock}
              to="/recruteur/candidatures"
            />
            <StatCard
              label="Acceptées"
              value={stats.candidatures_acceptees}
              icon={CheckCircle}
              to="/recruteur/candidatures"
            />
            <StatCard
              label="Messages non lus"
              value={stats.messages_non_lus}
              icon={MessageSquare}
              to="/recruteur/messagerie"
            />
            <StatCard
              label="Avis reçus"
              value={stats.avis_recus}
              icon={Star}
              to="/recruteur/avis"
            />
            <StatCard
              label="Notifications"
              value={stats.notifications_non_lues}
              icon={Bell}
              to="/recruteur/notifications"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card
              title="Mes offres"
              action={
                <Link to="/recruteur/offres" className="text-sm font-semibold text-primary hover:underline">
                  Tout voir
                </Link>
              }
            >
              {stats.mes_offres?.length ? (
                <ul className="space-y-2">
                  {stats.mes_offres.slice(0, 5).map((o) => (
                    <li
                      key={o.id_offre || o.titre}
                      className="flex justify-between gap-2 p-3 rounded-xl bg-bg-page/50 text-sm hover:bg-primary-soft/30 transition-colors"
                    >
                      <span className="font-medium text-text-dark truncate">{o.titre}</span>
                      <span className="text-text-secondary shrink-0 tabular-nums">{o.candidatures} cand.</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary py-4 text-center">Aucune offre publiée.</p>
              )}
            </Card>

            <Card
              title="Candidatures récentes"
              action={
                <Link to="/recruteur/candidatures" className="text-sm font-semibold text-primary hover:underline">
                  Tout voir
                </Link>
              }
            >
              {stats.recent_candidatures?.length ? (
                <ul className="space-y-2">
                  {stats.recent_candidatures.slice(0, 5).map((c) => {
                    const st = getCandidatureStatut(c.statut);
                    return (
                      <li key={c.id_candidature} className="p-3 rounded-xl bg-bg-page/50 hover:bg-primary-soft/20 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-text-dark text-sm truncate">{c.candidat}</p>
                            <p className="text-xs text-text-secondary truncate">{c.offre}</p>
                            {c.date_label && (
                              <p className="text-xs text-text-secondary/80 mt-1">{c.date_label}</p>
                            )}
                          </div>
                          <StatusBadge label={st.label} variant={st.variant} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary py-4 text-center">Aucune candidature récente.</p>
              )}
            </Card>

            <Card
              title="Messages reçus"
              action={
                <Link to="/recruteur/messagerie" className="text-sm font-semibold text-primary hover:underline">
                  Messagerie
                </Link>
              }
            >
              {stats.recent_messages?.length ? (
                <ul className="space-y-2">
                  {stats.recent_messages.map((m) => (
                    <li
                      key={m.id_message}
                      className={`p-3 rounded-xl text-sm ${
                        !m.lu ? 'bg-primary-soft/50 border border-primary/10' : 'bg-bg-page/50'
                      }`}
                    >
                      <p className="font-medium text-text-dark">{m.expediteur}</p>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">{m.contenu}</p>
                      <p className="text-xs text-primary mt-1">{m.date_label}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary py-4 text-center">Aucun message reçu.</p>
              )}
            </Card>

            <Card
              title="Avis candidats"
              action={
                <Link to="/recruteur/avis" className="text-sm font-semibold text-primary hover:underline">
                  Tout voir
                </Link>
              }
            >
              {stats.recent_avis?.length ? (
                <ul className="space-y-2">
                  {stats.recent_avis.slice(0, 4).map((a) => (
                    <li key={a.id_avis} className="p-3 rounded-xl bg-bg-page/50 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-text-dark">{a.auteur}</p>
                        <span className="text-amber-500 text-xs">{'★'.repeat(a.note)}</span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1">{a.commentaire}</p>
                      {a.offre && (
                        <p className="text-xs text-primary mt-1 truncate">{a.offre}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary py-4 text-center">Aucun avis reçu.</p>
              )}
            </Card>
          </div>

          {stats.recent_notifications?.length > 0 && (
            <Card
              title="Notifications récentes"
              action={
                <Link
                  to="/recruteur/notifications"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Tout voir ({stats.notifications_non_lues} non lue{stats.notifications_non_lues !== 1 ? 's' : ''})
                  <ChevronRight className="w-4 h-4" />
                </Link>
              }
            >
              <ul className="grid sm:grid-cols-2 gap-2">
                {stats.recent_notifications.slice(0, 4).map((n) => (
                  <li
                    key={n.id_notification}
                    className={`p-3 rounded-xl text-sm ${
                      !n.lu ? 'bg-amber-50 border border-amber-100' : 'bg-bg-page/50'
                    }`}
                  >
                    {n.type === 'candidature' && n.candidat_nom ? (
                      <>
                        <p className="font-medium text-text-dark">{n.candidat_nom}</p>
                        {n.offre_titre && (
                          <p className="text-xs text-primary mt-0.5 truncate">{n.offre_titre}</p>
                        )}
                        <p className="text-xs text-text-secondary mt-1">{n.date_label}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-text-dark">{n.titre}</p>
                        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{n.message}</p>
                        <p className="text-xs text-text-secondary mt-1">{n.date_label}</p>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
