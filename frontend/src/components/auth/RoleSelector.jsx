import { motion } from 'framer-motion';
import { Building2, UserSearch, Check } from 'lucide-react';

const ROLES = [
  {
    value: 'candidat',
    title: 'Je cherche un emploi',
    subtitle: 'Créez votre profil et postulez aux offres',
    icon: UserSearch,
    selectedBorder: 'border-primary',
    selectedBg: 'bg-[#EEF2FF]',
    checkColor: 'bg-primary',
  },
  {
    value: 'recruteur',
    title: 'Je recrute',
    subtitle: 'Publiez des offres et trouvez des candidats',
    icon: Building2,
    selectedBorder: 'border-accent',
    selectedBg: 'bg-[#ECFDF5]',
    checkColor: 'bg-accent',
  },
];

export default function RoleSelector({ selected, onSelect, layout = 'page' }) {
  const isModal = layout === 'modal';

  return (
    <div
      className={`grid gap-4 ${
        isModal ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
      }`}
    >
      {ROLES.map((role) => {
        const isSelected = selected === role.value;
        const Icon = role.icon;
        return (
          <motion.button
            key={role.value}
            type="button"
            onClick={() => onSelect(role.value)}
            whileTap={{ scale: 0.98 }}
            animate={{ scale: isSelected ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
              isSelected
                ? `${role.selectedBorder} ${role.selectedBg} shadow-sm`
                : 'border-transparent bg-white hover:border-gray-200'
            } ${isModal ? '' : 'auth-card'}`}
          >
            {isSelected && (
              <span
                className={`absolute top-3 right-3 w-6 h-6 rounded-full ${role.checkColor} flex items-center justify-center`}
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </span>
            )}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                isSelected
                  ? role.value === 'recruteur'
                    ? 'bg-accent/20 text-accent'
                    : 'bg-primary/15 text-primary'
                  : 'bg-bg-page text-text-secondary'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <p className="font-semibold text-text-dark">{role.title}</p>
            <p className="text-sm text-text-secondary mt-1">{role.subtitle}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
