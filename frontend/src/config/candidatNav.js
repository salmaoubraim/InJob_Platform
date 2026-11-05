import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FileUser,
  MessageSquare,
  Bell,
  Star,
  User,
} from 'lucide-react';

export const CANDIDAT_NAV = [
  { to: '/candidat/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/candidat/offres', label: 'Offres d\'emploi', icon: Briefcase },
  { to: '/candidat/candidatures', label: 'Mes candidatures', icon: FileText },
  { to: '/candidat/cv', label: 'Mon CV', icon: FileUser },
  { to: '/candidat/messagerie', label: 'Messages', icon: MessageSquare },
  { to: '/candidat/notifications', label: 'Notifications', icon: Bell },
  { to: '/candidat/avis', label: 'Avis des recruteurs', icon: Star },
];

export const CANDIDAT_PROFILE_LINK = {
  to: '/candidat/profil',
  label: 'Mon profil',
  icon: User,
};
