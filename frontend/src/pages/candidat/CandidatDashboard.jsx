import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  MessageSquare,
  Bell,
  FileUser,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import PageShell from '../../components/ui/PageShell';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { fetchDashboardStats } from '../../services/dashboardService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { getCandidatureStatut } from '../../utils/candidatureStatus';
import { useAuth } from '../../context/AuthContext';

const EMPTY_STATS = {
  candidatures_total: 0,
  candidatures_en_attente: 0,
  candidatures_acceptees: 0,
  candidatures_refusees: 0,
  notifications_non_lues: 0,
  messages_non_lus: 0,
  offres_disponibles: 0,
  a_cv: false,
  mes_candidatures: [],
  recent_offres: [],
  recent_notifications: [],
};

export default function CandidatDashboard() {
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
  const applicationsLabel =
    stats.candidatures_total <= 1
      ? `${stats.candidatures_total} candidature`
      : `${stats.candidatures_total} candidatures`;

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
                {!stats.a_cv && (
                  <p className="text-amber-200 mt-2 text-sm">Téléversez votre CV pour postuler aux offres.</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm bg-white/10 rounded-xl px-4 py-2">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>{applicationsLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <StatCard label="Candidatures" value={stats.candidatures_total} icon={FileText} to="/candidat/candidatures" />
            <StatCard label="En attente" value={stats.candidatures_en_attente} icon={Clock} to="/candidat/candidatures" />
            <StatCard label="Acceptées" value={stats.candidatures_acceptees} icon={CheckCircle} to="/candidat/candidatures" />
            <StatCard label="Refusées" value={stats.candidatures_refusees} icon={XCircle} to="/candidat/candidatures" />
            <StatCard label="Messages" value={stats.messages_non_lus} icon={MessageSquare} to="/candidat/messagerie" />
            <StatCard label="Notifications" value={stats.notifications_non_lues} icon={Bell} to="/candidat/notifications" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card
              title="Mes candidatures"
              action={
                <Link to="/candidat/candidatures" className="text-sm font-semibold text-primary hover:underline">
                  Tout voir
                </Link>
              }
            >
              {stats.mes_candidatures.length === 0 ? (
                <p className="text-sm text-text-secondary">Aucune candidature pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.mes_candidatures.map((c) => {
                    const st = getCandidatureStatut(c.statut);
                    return (
                      <li key={c.id_candidature}>
                        <Link
                          to="/candidat/candidatures"
                          className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary-soft/20 transition-all group"
                        >
                          {c.image && (
                            <img src={c.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-text-dark truncate">{c.offre_titre}</p>
                              <StatusBadge label={st.label} variant={st.variant} />
                            </div>
                            <p className="text-sm text-text-secondary mt-0.5 truncate">
                              {c.recruteur_contact ? `${c.recruteur_contact} — ${c.recruteur_nom}` : c.recruteur_nom}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">{c.date_label}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary shrink-0 group-hover:text-primary" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card
              title="Offres récentes"
              action={
                <Link to="/candidat/offres" className="text-sm font-semibold text-primary hover:underline">
                  Voir les offres
                </Link>
              }
            >
              {stats.recent_offres.length === 0 ? (
                <p className="text-sm text-text-secondary">Aucune offre disponible.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.recent_offres.map((o) => (
                    <li key={o.id_offre}>
                      <Link
                        to={`/candidat/offres/${o.id_offre}`}
                        className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary-soft/20 transition-all"
                      >
                        {o.image && (
                          <img src={o.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-text-dark truncate">{o.titre}</p>
                          <p className="text-sm text-text-secondary truncate">
                            {o.recruteur_contact ? `${o.recruteur_contact} — ${o.entreprise}` : o.entreprise}
                          </p>
                          {o.ville && <p className="text-xs text-text-secondary mt-1">{o.ville}</p>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/candidat/offres"
              className="bg-white rounded-2xl p-5 border border-gray-100 auth-card flex items-center gap-4 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-dark">{stats.offres_disponibles}</p>
                <p className="text-sm text-text-secondary">Offres disponibles</p>
              </div>
            </Link>
            <Link
              to="/candidat/cv"
              className="bg-white rounded-2xl p-5 border border-gray-100 auth-card flex items-center gap-4 hover:shadow-md transition-all"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stats.a_cv ? 'bg-green-50' : 'bg-amber-50'}`}>
                <FileUser className={`w-5 h-5 ${stats.a_cv ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-dark">Mon CV</p>
                <p className="text-sm text-text-secondary">{stats.a_cv ? 'CV enregistré' : 'À téléverser'}</p>
              </div>
            </Link>
            <Link
              to="/candidat/messagerie"
              className="bg-white rounded-2xl p-5 border border-gray-100 auth-card flex items-center gap-4 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-dark">{stats.messages_non_lus}</p>
                <p className="text-sm text-text-secondary">Messages non lus</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
