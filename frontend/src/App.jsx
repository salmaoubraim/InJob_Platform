import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { DashboardSearchProvider } from './context/DashboardSearchContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import AuthModalHost from './components/auth/AuthModalHost';

const basename = import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') || '';

function AppRoutesTree() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthModalProvider>
          <DashboardSearchProvider placeholder="Rechercher une offre">
            <AppRoutes />
            <AuthModalHost />
          </DashboardSearchProvider>
        </AuthModalProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutesTree />
    </BrowserRouter>
  );
}

export default App;
