import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Bell,
  Star,
  User,
} from 'lucide-react';

export const RECRUTEUR_NAV = [
  { to: '/recruteur/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/recruteur/offres', label: 'Mes offres', icon: Briefcase },
  { to: '/recruteur/candidatures', label: 'Candidatures reçues', icon: Users },
  { to: '/recruteur/messagerie', label: 'Messages', icon: MessageSquare },
  { to: '/recruteur/notifications', label: 'Notifications', icon: Bell },
  { to: '/recruteur/avis', label: 'Avis et commentaires', icon: Star },
];

export const RECRUTEUR_PROFILE_LINK = {
  to: '/recruteur/profil',
  label: 'Profil entreprise',
  icon: User,
};
