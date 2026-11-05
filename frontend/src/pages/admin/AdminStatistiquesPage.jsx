import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  Loader2,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminBarChart from '../../components/admin/charts/AdminBarChart';
import AdminLineChart from '../../components/admin/charts/AdminLineChart';
import AdminDoughnutChart from '../../components/admin/charts/AdminDoughnutChart';
import { fetchAdminStatistics } from '../../services/adminStatisticsService';

const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function AdminStatistiquesPage() {
  const { t, i18n } = useTranslation('admin');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAdminStatistics()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <AdminPageShell title={t('stats.title')} subtitle={t('stats.subtitle')}>
        <p className="text-center py-16 text-text-secondary">{t('common.noData')}</p>
      </AdminPageShell>
    );
  }

  const cards = stats.cards || {};
  const charts = stats.charts || {};

  const statCards = [
    { label: t('stats.cards.users'), value: cards.utilisateurs, icon: Users },
    { label: t('stats.cards.activeOffers'), value: cards.offres_actives, icon: Briefcase },
    { label: t('stats.cards.candidates'), value: cards.candidats, icon: Users },
    { label: t('stats.cards.recruiters'), value: cards.recruteurs, icon: Building2 },
  ];

  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR';

  return (
    <AdminPageShell title={t('stats.title')} subtitle={t('stats.subtitle')}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            {...cardMotion}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className="admin-stat-card bg-white rounded-2xl p-5 border border-gray-100 auth-card"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-text-dark">
              {typeof value === 'number' ? value.toLocaleString(locale) : value}
            </p>
            <p className="text-sm text-text-secondary mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <ChartCard title={t('stats.charts.applicationsByMonth')} icon={BarChart3} delay={0.15}>
          <AdminBarChart
            data={charts.candidatures_par_mois || []}
            label={t('stats.cards.applications')}
          />
        </ChartCard>

        <ChartCard title={t('stats.charts.byCategory')} delay={0.2}>
          {(charts.offres_par_categorie || []).length > 0 ? (
            <AdminDoughnutChart data={charts.offres_par_categorie} />
          ) : (
            <p className="text-sm text-text-secondary py-12 text-center">{t('common.noData')}</p>
          )}
        </ChartCard>

        <ChartCard title={t('stats.charts.registrations')} delay={0.25}>
          <AdminLineChart
            series={[
              {
                label: t('stats.charts.candidates'),
                color: '#4361EE',
                data: charts.inscriptions_par_mois?.candidats || [],
              },
              {
                label: t('stats.charts.recruiters'),
                color: '#06D6A0',
                data: charts.inscriptions_par_mois?.recruteurs || [],
              },
            ]}
          />
        </ChartCard>

        <ChartCard title={t('stats.charts.offersByMonth')} icon={Activity} delay={0.3}>
          <AdminBarChart
            data={charts.offres_par_mois || []}
            label={t('stats.cards.activeOffers')}
            color="#06D6A0"
          />
        </ChartCard>
      </div>
    </AdminPageShell>
  );
}

function ChartCard({ title, icon: Icon, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="admin-stat-card bg-white rounded-2xl p-6 border border-gray-100 auth-card"
    >
      <h2 className="font-semibold text-text-dark flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        {title}
      </h2>
      {children}
    </motion.div>
  );
}
