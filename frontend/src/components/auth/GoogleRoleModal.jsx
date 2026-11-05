import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import RoleSelector from './RoleSelector';
import UserAvatar from '../common/UserAvatar';

export default function GoogleRoleModal({
  open,
  email,
  prenom,
  nom,
  photo,
  initialRole = '',
  onConfirm,
  onClose,
}) {
  const [role, setRole] = useState(initialRole);
  const [nomEntreprise, setNomEntreprise] = useState('');

  useEffect(() => {
    if (open) {
      setRole(initialRole || '');
      setNomEntreprise('');
    }
  }, [open, initialRole]);

  if (!open) return null;

  const displayUser = {
    prenom: prenom || 'Utilisateur',
    nom: nom || 'Google',
    email,
    photo_url: photo,
    photo_profil: photo,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-text-dark/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 auth-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <UserAvatar user={displayUser} size="lg" />
            <h3 className="text-xl font-bold text-text-dark mt-4">
              Bienvenue {prenom} !
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {email}
            </p>
          </div>

          <p className="text-sm font-medium text-text-dark text-center mb-4">
            Choisissez votre rôle sur InJob
          </p>

          <RoleSelector selected={role} onSelect={setRole} layout="modal" />

          {role === 'recruteur' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-dark mb-1.5">
                Nom de l&apos;entreprise
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  value={nomEntreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                  placeholder="Mon entreprise"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!role || (role === 'recruteur' && !nomEntreprise.trim())}
            onClick={() => role && onConfirm(role, {
              nom_entreprise: role === 'recruteur' ? nomEntreprise.trim() : undefined,
            })}
            className="mt-6 w-full h-12 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-primary-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Créer mon compte
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
