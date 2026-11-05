import { Outlet } from 'react-router-dom';
import AppHeader from '../AppHeader';
import LandingFooter from '../LandingFooter';
import { useScrollToTopOnNavigate } from '../../../hooks/useScrollToTopOnNavigate';

/** Candidat / recruteur : même header que l'accueil, navigation via le menu profil. */
export default function AppShellLayout() {
  useScrollToTopOnNavigate();

  return (
    <div className="min-h-screen w-full bg-bg-page flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 sm:px-8 lg:px-10 py-8">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
