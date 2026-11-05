import { NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import UserAvatar from '../../common/UserAvatar';
import { getDisplayName, ROLE_LABELS } from '../../../utils/profileMenu';

export default function AppSidebar({ navItems, profileLink, roleLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex w-64 min-h-screen bg-primary-dark text-white flex-col shrink-0">
      <div className="p-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white leading-tight">InJob</p>
          <p className="text-xs text-white/70">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
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
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <NavLink
          to={profileLink.to}
          className={({ isActive }) =>
            `admin-nav-link flex items-center gap-3 w-full px-3 py-3 rounded-xl mb-2 ${
              isActive ? 'admin-nav-active' : 'admin-nav-idle'
            }`
          }
        >
          <UserAvatar
            key={user?.photo_url || user?.photo_profil || 'app-photo'}
            user={user}
            size="sm"
          />
          <div className="min-w-0 text-left leading-tight">
            <p className="text-sm font-semibold text-white capitalize truncate">
              {getDisplayName(user)}
            </p>
            <p className="text-xs text-white/70 truncate">
              {ROLE_LABELS[user?.role] || user?.role}
            </p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
