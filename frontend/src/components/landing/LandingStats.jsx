import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchLandingStats } from '../../services/dashboardService';

export default function LandingStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLandingStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const items = stats
    ? [
        { value: `${stats.candidats}+`, label: 'Candidats inscrits' },
        { value: `${stats.recruteurs}+`, label: 'Entreprises' },
        { value: `${stats.offres_publiees}+`, label: 'Offres publiées' },
        { value: `${stats.villes || stats.categories}+`, label: 'Villes couvertes' },
      ]
    : [
        { value: '10K+', label: 'Candidats actifs' },
        { value: '2K+', label: 'Entreprises' },
        { value: '500+', label: 'Offres publiées' },
        { value: '12+', label: 'Villes au Maroc' },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.45 }}
      className="mt-12 flex flex-wrap justify-center items-stretch gap-4 sm:gap-6"
    >
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl px-8 py-5 auth-card text-center min-w-[140px] sm:min-w-[160px] flex-1 sm:flex-none max-w-[200px]"
        >
          <p className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</p>
          <p className="text-sm text-text-secondary mt-1">{s.label}</p>
        </div>
      ))}
    </motion.div>
  );
}
