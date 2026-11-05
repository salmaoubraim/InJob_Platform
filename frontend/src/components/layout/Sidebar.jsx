import { NavLink } from 'react-router-dom';
import { Briefcase, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navByRole = {
  candidat: [
    { to: '/candidat/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  ],
  recruteur: [
    { to: '/recruteur/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = navByRole[user?.role] || [];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-text-dark">InJob</p>
          <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-text-secondary hover:bg-bg-page hover:text-text-dark'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
