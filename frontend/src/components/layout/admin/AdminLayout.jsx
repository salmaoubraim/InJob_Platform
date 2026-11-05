import { Outlet } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import { useScrollToTopOnNavigate } from '../../../hooks/useScrollToTopOnNavigate';
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll';
import { AdminSettingsProvider, useAdminSettings } from '../../../context/AdminSettingsContext';
import i18n from '../../../i18n';

function AdminLayoutInner() {
  useScrollToTopOnNavigate();
  useLockBodyScroll(true);
  const { darkMode } = useAdminSettings();

  return (
    <div className={`h-screen overflow-hidden bg-bg-page admin-shell ${darkMode ? 'admin-dark' : ''}`}>
      <AdminSidebar />
      <div className="flex flex-col min-w-0 min-h-0 h-screen ml-64">
        <AdminTopBar />
        <main className="flex-1 min-h-0 p-6 lg:p-8 overflow-y-auto admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <AdminSettingsProvider>
        <AdminLayoutInner />
      </AdminSettingsProvider>
    </I18nextProvider>
  );
}
