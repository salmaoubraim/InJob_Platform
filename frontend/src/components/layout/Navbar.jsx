import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardSearch } from '../../context/DashboardSearchContext';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar({ title, showSearch = true }) {
  const { user } = useAuth();
  const { query, setQuery, placeholder } = useDashboardSearch();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 gap-4">
      <h1 className="text-lg font-semibold text-text-dark shrink-0">{title}</h1>

      <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-bg-page rounded-xl px-4 py-2 flex-1 max-w-md border border-transparent focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10">
            <Search className="w-4 h-4 text-text-secondary shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="bg-transparent text-sm outline-none w-full text-text-dark placeholder:text-text-secondary"
              aria-label="Rechercher des offres"
            />
          </div>
        )}

        <NotificationBell />

        <div className="flex items-center gap-3 pl-2 border-l border-gray-100 shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {user?.prenom?.[0]}
            {user?.nom?.[0]}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text-dark">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-text-secondary">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
