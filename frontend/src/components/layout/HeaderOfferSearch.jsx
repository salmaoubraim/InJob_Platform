import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardSearch } from '../../context/DashboardSearchContext';
import { scrollToSection } from '../../utils/scrollToSection';
import { isLandingPath, navigateToLandingSection } from '../../utils/landingNavigation';
import { getOffersPathForRole, isOffersPath } from '../../utils/offersNavigation';

export default function HeaderOfferSearch({ className = '' }) {
  const { query, setQuery, placeholder, enabled } = useDashboardSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!enabled) return null;

  const goToOffers = () => {
    const offersPath = user?.role ? getOffersPathForRole(user.role) : '/offres';
    if (isOffersPath(location.pathname)) return;
    if (user?.role || !isLandingPath(location.pathname)) {
      navigate(offersPath);
      return;
    }
    if (isLandingPath(location.pathname)) {
      scrollToSection('offres');
      return;
    }
    navigateToLandingSection(navigate, 'offres');
  };

  return (
    <div className={className}>
      <label htmlFor="header-offers-search" className="sr-only">
        Rechercher des offres
      </label>
      <div className="relative w-full">
        <input
          id="header-offers-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={goToOffers}
          placeholder={placeholder}
          className="w-full h-10 pl-4 pr-10 rounded-full border-2 border-gray-300 bg-white text-sm text-text-dark placeholder:text-text-secondary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Rechercher des offres d'emploi"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
          aria-hidden
        />
      </div>
    </div>
  );
}
