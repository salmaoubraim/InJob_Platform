import {
  User,
  MessageSquare,
  Bell,
  Star,
  FileText,
  FileUser,
  Briefcase,
  Users,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

export const ROLE_LABELS = {
  candidat: 'Candidat',
  recruteur: 'Recruteur',
  admin: 'Administrateur',
};

const COMMON = [
  { label: 'Profil', icon: User, path: (role) => `/${role}/profil` },
  { label: 'Messagerie', icon: MessageSquare, path: (role) => `/${role}/messagerie` },
  { label: 'Notifications', icon: Bell, path: (role) => `/${role}/notifications` },
  { label: 'Avis et commentaires', icon: Star, path: (role) => `/${role}/avis` },
];

const ROLE_ITEMS = {
  candidat: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: () => '/candidat/dashboard' },
    { label: 'Offres d\'emploi', icon: Briefcase, path: () => '/candidat/offres' },
    { label: 'Mes candidatures', icon: FileText, path: () => '/candidat/candidatures' },
    { label: 'Mon CV', icon: FileUser, path: () => '/candidat/cv' },
  ],
  recruteur: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: () => '/recruteur/dashboard' },
    { label: 'Mes offres', icon: Briefcase, path: () => '/recruteur/offres' },
    { label: 'Candidatures reçues', icon: Users, path: () => '/recruteur/candidatures' },
  ],
  admin: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: () => '/admin/dashboard' },
    { label: 'Utilisateurs', icon: Users, path: () => '/admin/utilisateurs' },
    { label: 'Offres', icon: Briefcase, path: () => '/admin/offres' },
  ],
};

export function getProfileMenuItems(role) {
  if (!role) return [];
  const roleItems = ROLE_ITEMS[role] || [];
  const common = COMMON.map((item) => ({
    ...item,
    to: item.path(role),
  }));
  const specific = roleItems.map((item) => ({
    ...item,
    to: item.path(role),
  }));
  return [...specific, ...common];
}

export const LOGOUT_ITEM = { label: 'Se déconnecter', icon: LogOut, action: 'logout' };

export function getUserInitials(user) {
  const a = user?.prenom?.[0] || '';
  const b = user?.nom?.[0] || '';
  return (a + b).toUpperCase() || '?';
}

export function getDisplayName(user) {
  if (!user) return '';
  return user.prenom?.toLowerCase() || user.email?.split('@')[0] || 'Utilisateur';
}
