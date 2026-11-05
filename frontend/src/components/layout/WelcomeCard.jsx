import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleLabels = {
  candidat: 'Candidat',
  recruteur: 'Recruteur',
  admin: 'Administrateur',
};

const roleMessages = {
  candidat: 'Explorez les offres, postulez et suivez vos candidatures en un seul endroit.',
  recruteur: 'Publiez vos offres, consultez les candidatures et trouvez les meilleurs talents.',
  admin: 'Gérez la plateforme, les utilisateurs et l\'activité globale d\'InJob.',
};

export default function WelcomeCard({ stats = [] }) {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {roleLabels[user?.role]}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-dark">
            Bienvenue, {user?.prenom}
          </h2>
          <p className="text-text-secondary max-w-xl leading-relaxed">
            {roleMessages[user?.role]}
          </p>
        </div>

        {stats.length > 0 && (
          <div className="flex gap-4 flex-wrap">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-bg-page rounded-xl px-5 py-4 min-w-[120px]"
              >
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
