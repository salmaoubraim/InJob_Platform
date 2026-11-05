import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Briefcase,
  Building2,
  Download,
  Loader2,
  Star,
  Users,
} from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminBarChart from '../../components/admin/charts/AdminBarChart';
import StatusBadge from '../../components/ui/StatusBadge';
import UserAvatar from '../../components/common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { fetchDashboardStats, fetchLandingStats } from '../../services/dashboardService';
import { fetchAdminStatistics } from '../../services/adminStatisticsService';
import { generateAdminDashboardPdf } from '../../utils/adminPdfReport';
import { getCandidatureStatut } from '../../utils/candidatureStatus';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation('admin');
  const { user } = useAuth();
  const [cards, setCards] = useState({ utilisateurs: 0, recruteurs: 0, candidatures: 0, note_moyenne: null, avis: 0 });
  const [stats, setStats] = useState({ candidatures_par_mois: [], inscriptions_recentes: [], candidatures_recentes_table: [], system: {} });
  const [fullStats, setFullStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [statsRes, dashRes, landingRes] = await Promise.allSettled([
        fetchAdminStatistics(),
        fetchDashboardStats(),
        fetchLandingStats(),
      ]);

      if (cancelled) return;

      const adminStats = statsRes.status === 'fulfilled' ? statsRes.value : {};
      const dash = dashRes.status === 'fulfilled' ? dashRes.value : {};
      const landing = landingRes.status === 'fulfilled' ? landingRes.value : {};
      const cardData = adminStats.cards || {};
      const landingUsers = (landing.candidats ?? 0) + (landing.recruteurs ?? 0);

      setFullStats(statsRes.status === 'fulfilled' ? adminStats : null);
      setCards({
        utilisateurs: cardData.utilisateurs ?? dash.utilisateurs ?? landingUsers ?? 0,
        recruteurs: cardData.recruteurs ?? dash.recruteurs ?? landing.recruteurs ?? 0,
        candidatures: cardData.candidatures ?? dash.candidatures ?? landing.candidatures ?? 0,
        note_moyenne: cardData.note_moyenne ?? dash.note_moyenne ?? null,
        avis: cardData.avis ?? dash.avis ?? 0,
      });
      setStats({
        candidatures_par_mois: dash.candidatures_par_mois || adminStats.charts?.candidatures_par_mois || [],
        inscriptions_recentes: dash.inscriptions_recentes || [],
        candidatures_recentes_table: dash.candidatures_recentes_table || [],
        note_moyenne: cardData.note_moyenne ?? dash.note_moyenne,
        avis: cardData.avis ?? dash.avis,
        system: adminStats.system || {},
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  const summaryCards = [
    { label: t('stats.cards.users'), value: cards.utilisateurs ?? 0, icon: Users, iconBg: 'bg-emerald-50 text-emerald-600' },
    { label: t('stats.cards.applications'), value: cards.candidatures ?? 0, icon: Briefcase, iconBg: 'bg-primary-soft text-primary' },
    { label: t('stats.cards.recruiters'), value: cards.recruteurs ?? 0, icon: Building2, iconBg: 'bg-primary-soft text-primary' },
  ];

  const handleReport = async () => {
    setPdfLoading(true);
    try {
      const data = fullStats || (await fetchAdminStatistics());
      generateAdminDashboardPdf(data, i18n.language);
    } finally {
      setPdfLoading(false);
    }
  };

  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const system = stats.system || {};

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminPageShell
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle', { name: user?.prenom || 'Admin' })}
      action={
        <button
          type="button"
          onClick={handleReport}
          disabled={pdfLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t('dashboard.generateReport')}
        </button>
      }
    >
      <div className="grid sm:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, iconBg }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 auth-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold text-text-dark mt-5">{Number(value).toLocaleString(locale)}</p>
            <p className="text-sm text-text-secondary mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 auth-card">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
            {t('stats.charts.applicationsByMonth')}
          </p>
          <AdminBarChart
            data={(stats.candidatures_par_mois || []).map((d) => ({
              period: d.period || d.label,
              count: d.count,
            }))}
            label={t('stats.cards.applications')}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 auth-card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-text-dark">{t('dashboard.recentRecruiters')}</p>
              <Link to="/admin/utilisateurs" className="text-sm text-primary font-medium hover:underline">{t('dashboard.seeAll')}</Link>
            </div>
            {stats.inscriptions_recentes?.length ? (
              <ul className="space-y-2 text-sm">
                {stats.inscriptions_recentes.slice(0, 3).map((row) => (
                  <li key={`${row.nom}-${row.date}`} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar user={row.user || { nom: row.nom }} size="sm" />
                      <span className="text-text-dark font-medium truncate">{row.nom}</span>
                    </div>
                    <span className="text-text-secondary shrink-0">{row.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary">{t('dashboard.noRecentRecruiters')}</p>
            )}
          </div>

          <div className="bg-[#ECFDF5] rounded-2xl p-5 border border-emerald-100 auth-card">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" />
              <p className="font-semibold">{t('dashboard.globalRating')}</p>
            </div>
            <p className="text-3xl font-bold text-text-dark">
              {stats.note_moyenne != null ? stats.note_moyenne : '—'}
              <span className="text-lg font-normal text-text-secondary"> / 5.0</span>
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {t('dashboard.basedOnReviews', { count: stats.avis ?? 0 })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 auth-card">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t('stats.system.serverStatus')}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`w-2.5 h-2.5 rounded-full ${system.database_connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="font-semibold text-text-dark">
              {system.database_connected ? t('common.online') : t('common.offline')}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            {t('stats.system.lastCheck')} : {new Date().toLocaleString(locale)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 auth-card">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            {t('stats.system.title')}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-text-secondary uppercase">{t('stats.system.responseTime')}</p>
              <p className="text-2xl font-bold text-text-dark mt-1">
                {system.response_time_ms != null ? `${system.response_time_ms} ms` : t('common.unavailable')}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase">{t('stats.system.activeSessions')}</p>
              <p className="text-2xl font-bold text-text-dark mt-1">
                {system.active_sessions != null ? system.active_sessions : t('common.unavailable')}
              </p>
            </div>
          </div>
          <Link to="/admin/statistiques" className="text-sm text-primary font-medium mt-4 inline-block hover:underline">
            {t('dashboard.allStats')}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 auth-card mt-6 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-text-dark">{t('dashboard.recentApplications')}</h2>
          <Link to="/admin/candidatures" className="text-sm text-primary font-medium hover:underline">{t('dashboard.seeAll')}</Link>
        </div>
        {stats.candidatures_recentes_table?.length ? (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-text-secondary text-xs uppercase">
                <th className="pb-2 pr-3">{t('applications.candidate')}</th>
                <th className="pb-2 pr-3">{t('applications.offer')}</th>
                <th className="pb-2 pr-3">{t('applications.recruiter')}</th>
                <th className="pb-2 pr-3">{t('applications.date')}</th>
                <th className="pb-2">{t('users.columns.status')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.candidatures_recentes_table.map((row, i) => {
                const st = getCandidatureStatut(row.statut);
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-bg-page/40">
                    <td className="py-2.5 pr-3 font-medium text-text-dark">{row.candidat}</td>
                    <td className="py-2.5 pr-3">{row.offre}</td>
                    <td className="py-2.5 pr-3">{row.recruteur}</td>
                    <td className="py-2.5 pr-3 text-text-secondary">{row.date}</td>
                    <td className="py-2.5"><StatusBadge label={st.label} variant={st.variant} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-text-secondary py-4 text-center">{t('dashboard.noRecentApplications')}</p>
        )}
      </div>
    </AdminPageShell>
  );
}
