import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { scrollToSection } from '../../utils/scrollToSection';
import {
  isLandingPath,
  navigateToLandingSection,
  readLandingSection,
} from '../../utils/landingNavigation';
import { getOffersPathForRole, isOffersPath } from '../../utils/offersNavigation';
import InJobLogo from './InJobLogo';
import HeaderOfferSearch from './HeaderOfferSearch';
import HeaderUserMenu from './HeaderUserMenu';

const NAV_LINKS = [
  { label: 'Accueil', to: '/', end: true, type: 'home' },
  { label: 'Offres', sectionId: 'offres', type: 'section' },
  { label: 'Fonctionnalités', sectionId: 'features', type: 'section' },
  { label: 'À propos', sectionId: 'about', type: 'section' },
  { label: 'Contact', to: '/contact', type: 'page' },
];

const navLinkClass = (isActive) =>
  `nav-underline-link inline-block text-sm font-medium whitespace-nowrap pb-2 ${
    isActive ? 'nav-underline-visible' : 'text-text-secondary'
  }`;

const navClass = ({ isActive }) => navLinkClass(isActive);

const mobileNavClass = (isActive) =>
  `block px-4 py-3 text-sm font-medium border-l-2 transition-all duration-300 ${
    isActive
      ? 'border-primary text-primary bg-primary-soft/40'
      : 'border-transparent text-text-secondary hover:border-primary hover:text-primary hover:bg-primary-soft/30'
  }`;

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = isLandingPath(location.pathname);
  const activeSection = useMemo(
    () => (isHome ? readLandingSection(location.hash) : ''),
    [isHome, location.hash, location.pathname, location.key],
  );
  const { isAuthenticated, user } = useAuth();
  const { openLogin, openRegister } = useAuthModal();

  const notifPath = user ? `/${user.role}/notifications` : null;

  const isNavSectionActive = (sectionId) => isHome && activeSection === sectionId;

  const offersPath = user?.role ? getOffersPathForRole(user.role) : '/offres';

  const goToSection = (sectionId) => {
    setOpen(false);
    if (sectionId === 'offres' && user?.role) {
      navigate(offersPath);
      return;
    }
    if (!isHome) {
      navigateToLandingSection(navigate, sectionId);
      return;
    }
    navigate(
      { pathname: '/', hash: sectionId === 'accueil' ? undefined : `#${sectionId}` },
      { replace: true },
    );
    scrollToSection(sectionId, { updateHistory: false });
  };

  const goHome = () => {
    setOpen(false);
    if (!isHome) {
      navigate({ pathname: '/' }, { state: { scrollTo: 'accueil' } });
      return;
    }
    navigate({ pathname: '/' }, { replace: true });
    scrollToSection('accueil', { updateHistory: false });
  };

  const renderNavItem = (item) => {
    if (item.type === 'home') {
      return (
        <a
          key={item.label}
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
          className={navLinkClass(isNavSectionActive('accueil'))}
        >
          {item.label}
        </a>
      );
    }
    if (item.type === 'page') {
      return (
        <NavLink key={item.label} to={item.to} className={navClass}>
          {item.label}
        </NavLink>
      );
    }
    if (item.sectionId === 'offres' && !isHome) {
      const to = user?.role ? offersPath : '/offres';
      return (
        <NavLink
          key={item.label}
          to={to}
          className={navClass}
          isActive={() => isOffersPath(location.pathname)}
        >
          {item.label}
        </NavLink>
      );
    }
    return (
      <a
        key={item.label}
        href={item.sectionId === 'accueil' ? '/' : `/#${item.sectionId}`}
        onClick={(e) => {
          e.preventDefault();
          goToSection(item.sectionId);
        }}
        className={navLinkClass(isNavSectionActive(item.sectionId))}
      >
        {item.label}
      </a>
    );
  };

  const renderMobileNavItem = (item) => {
    if (item.type === 'home') {
      return (
        <a
          key={item.label}
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
          className={mobileNavClass(isNavSectionActive('accueil'))}
        >
          {item.label}
        </a>
      );
    }
    if (item.type === 'page') {
      return (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) => mobileNavClass(isActive)}
        >
          {item.label}
        </NavLink>
      );
    }
    if (item.sectionId === 'offres' && !isHome) {
      const to = user?.role ? offersPath : '/offres';
      return (
        <NavLink
          key={item.label}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) => mobileNavClass(isActive || isOffersPath(location.pathname))}
        >
          {item.label}
        </NavLink>
      );
    }
    return (
      <a
        key={item.label}
        href={item.sectionId === 'accueil' ? '/' : `/#${item.sectionId}`}
        onClick={(e) => {
          e.preventDefault();
          goToSection(item.sectionId);
        }}
        className={mobileNavClass(isNavSectionActive(item.sectionId))}
      >
        {item.label}
      </a>
    );
  };

  const authButtons = (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          openLogin();
        }}
        className="px-5 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary-soft transition-colors whitespace-nowrap"
      >
        Connexion
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          openRegister();
        }}
        className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors whitespace-nowrap"
      >
        S&apos;inscrire
      </button>
    </>
  );

  const navMenu = (
    <nav
      className="flex items-center justify-center gap-3 xl:gap-5 whitespace-nowrap"
      aria-label="Navigation principale"
    >
      {NAV_LINKS.map(renderNavItem)}
    </nav>
  );

  const rightTools = (
    <div className="flex items-center gap-2 xl:gap-3 shrink-0">
      <HeaderOfferSearch className="w-[220px]" />
      <div className="flex items-center gap-2 shrink-0">
        {isAuthenticated && notifPath && <NotificationBell />}
        {isAuthenticated ? (
          <HeaderUserMenu onNavigate={() => setOpen(false)} />
        ) : (
          authButtons
        )}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="hidden lg:grid lg:grid-cols-[auto_1fr_max-content] lg:items-center h-16 w-full gap-3 xl:gap-4">
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <InJobLogo size="md" />
          </Link>

          <div className="flex justify-center min-w-0 px-1 -ml-6 xl:-ml-8">
            {navMenu}
          </div>

          <div className="flex items-center shrink-0 justify-self-end">
            {rightTools}
          </div>
        </div>

        <div className="lg:hidden h-16 flex items-center">
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <InJobLogo size="md" />
          </Link>
          <div className="hidden md:flex ml-auto">{rightTools}</div>
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-text-dark hover:bg-gray-50 ml-auto"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <HeaderOfferSearch className="md:hidden lg:hidden pb-3 max-w-[220px] mx-auto w-full" />

        {open && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <nav className="pt-2">{NAV_LINKS.map(renderMobileNavItem)}</nav>
            <div className="px-4 pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <HeaderUserMenu onNavigate={() => setOpen(false)} />
                  {notifPath && (
                    <Link
                      to={notifPath}
                      onClick={() => setOpen(false)}
                      className="text-center py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-text-dark"
                    >
                      Notifications
                    </Link>
                  )}
                </>
              ) : (
                authButtons
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
