import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  FolderTree,
  MessageSquare,
  Star,
  Bell,
  BarChart3,
  Settings,
  User,
} from 'lucide-react';

export const ADMIN_NAV = [
  { to: '/admin/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/admin/utilisateurs', labelKey: 'nav.users', icon: Users },
  { to: '/admin/offres', labelKey: 'nav.offers', icon: Briefcase },
  { to: '/admin/candidatures', labelKey: 'nav.applications', icon: FileText },
  { to: '/admin/categories', labelKey: 'nav.categories', icon: FolderTree },
  { to: '/admin/messages', labelKey: 'nav.messages', icon: MessageSquare },
  { to: '/admin/avis', labelKey: 'nav.reviews', icon: Star },
  { to: '/admin/notifications', labelKey: 'nav.notifications', icon: Bell },
  { to: '/admin/statistiques', labelKey: 'nav.statistics', icon: BarChart3 },
  { to: '/admin/parametres', labelKey: 'nav.settings', icon: Settings },
];

export const ADMIN_PROFILE_LINK = {
  to: '/admin/parametres?tab=profil',
  labelKey: 'nav.profile',
  icon: User,
};
