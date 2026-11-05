import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import NotificationBell from '../../notifications/NotificationBell';
import HeaderUserMenu from '../HeaderUserMenu';
import { useDashboardSearch } from '../../../context/DashboardSearchContext';
import { getOffersPathForRole } from '../../../utils/offersNavigation';

export default function AppTopBar({ navItems, mobileTitle, onMenuToggle, menuOpen }) {
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { query, setQuery, placeholder, enabled } = useDashboardSearch();
  const offersPath = getOffersPathForRole(
    location.pathname.startsWith('/recruteur') ? 'recruteur' : 'candidat'
  );

  const handleNavSearch = (e) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = navItems.find((item) => item.label.toLowerCase().includes(q));
    if (match) navigate(match.to);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-3 px-4 sm:px-6 shrink-0 sticky top-0 z-40">
      <button
        type="button"
        className="lg:hidden p-2 rounded-lg hover:bg-gray-50"
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <p className="lg:hidden font-semibold text-text-dark truncate">{mobileTitle}</p>

      <form
        className="hidden md:flex flex-1 max-w-md relative mr-auto"
        onSubmit={handleNavSearch}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dans le menu…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-page border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </form>

      {enabled && location.pathname.includes('/offres') && (
        <div className="hidden sm:block flex-1 max-w-xs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <NotificationBell />
        <HeaderUserMenu />
      </div>

      {enabled && !location.pathname.includes('/offres') && (
        <Link
          to={offersPath}
          className="hidden xl:inline-flex text-sm font-medium text-primary hover:underline"
        >
          Voir les offres
        </Link>
      )}
    </header>
  );
}
