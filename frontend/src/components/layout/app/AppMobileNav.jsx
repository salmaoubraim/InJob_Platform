import { NavLink } from 'react-router-dom';

export default function AppMobileNav({ navItems, open, onClose }) {
  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      <button
        type="button"
        className="flex-1 bg-black/40"
        onClick={onClose}
        aria-label="Fermer le menu"
      />
      <nav className="w-72 max-w-[85vw] bg-primary-dark text-white p-4 overflow-y-auto shadow-xl">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider px-3 mb-3">
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `admin-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-1 ${
                isActive ? 'admin-nav-active' : 'admin-nav-idle'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
