import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import UserAvatar from '../../common/UserAvatar';
import { getDisplayName } from '../../../utils/profileMenu';
import { ADMIN_NAV, ADMIN_PROFILE_LINK } from '../../../config/adminNav';
import { useAdminContactUnread } from '../../../hooks/useAdminContactUnread';

export default function AdminSidebar() {
  const { t } = useTranslation('admin');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { count: unreadMessages } = useAdminContactUnread();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="admin-sidebar fixed inset-y-0 left-0 z-30 w-64 bg-primary-dark text-white flex flex-col">
      <div className="p-5 flex items-center gap-3 border-b border-white/10 shrink-0">
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white leading-tight">{t('brand.title')}</p>
          <p className="text-xs text-white/70">{t('brand.subtitle')}</p>
        </div>
      </div>

      <nav className="admin-sidebar-nav flex-1 min-h-0 p-3 space-y-0.5">
        {ADMIN_NAV.map(({ to, labelKey, icon: Icon }) => {
          const showBadge = to === '/admin/messages' && unreadMessages > 0;
          return (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `admin-nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'admin-nav-active' : 'admin-nav-idle'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1 truncate">{t(labelKey)}</span>
              {showBadge && (
                <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-error text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <NavLink
          to={ADMIN_PROFILE_LINK.to}
          className={({ isActive }) =>
            `admin-nav-link flex items-center gap-3 w-full px-3 py-3 rounded-xl mb-2 ${
              isActive ? 'admin-nav-active' : 'admin-nav-idle'
            }`
          }
        >
          <UserAvatar
            key={user?.photo_url || user?.photo_profil || 'admin-photo'}
            user={user}
            size="sm"
          />
          <div className="min-w-0 text-left leading-tight">
            <p className="text-sm font-semibold text-white capitalize truncate">
              {getDisplayName(user)}
            </p>
            <p className="text-xs text-white/70 truncate">Admin</p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}
