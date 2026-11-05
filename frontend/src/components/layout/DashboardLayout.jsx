import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import LandingFooter from './LandingFooter';
import { useScrollToTopOnNavigate } from '../../hooks/useScrollToTopOnNavigate';

export default function DashboardLayout() {
  useScrollToTopOnNavigate();

  return (
    <div className="min-h-screen w-full bg-bg-page flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
