import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AppShellLayout from '../components/layout/app/AppShellLayout';
import PublicLayout from '../components/layout/PublicLayout';
import CandidatDashboard from '../pages/candidat/CandidatDashboard';
import RecruteurDashboard from '../pages/recruteur/RecruteurDashboard';
import RecruteurOffresPage from '../pages/recruteur/RecruteurOffresPage';
import AdminLayout from '../components/layout/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';
import ContactPage from '../pages/ContactPage';
import ProfilPage from '../pages/profil/ProfilPage';
import NotificationsPage from '../pages/shared/NotificationsPage';
import CandidaturesPage from '../pages/shared/CandidaturesPage';
import MessageriePage from '../pages/shared/MessageriePage';
import CandidatAvisPage from '../pages/candidat/CandidatAvisPage';
import RecruteurAvisPage from '../pages/recruteur/RecruteurAvisPage';
import CandidatOffresPage from '../pages/candidat/CandidatOffresPage';
import PublicOffresPage from '../pages/PublicOffresPage';
import PublicOffreDetailPage from '../pages/PublicOffreDetailPage';
import OffreDetailPage from '../pages/shared/OffreDetailPage';
import CvPage from '../pages/candidat/CvPage';
import AdminUtilisateursPage from '../pages/admin/AdminUtilisateursPage';
import AdminOffresPage from '../pages/admin/AdminOffresPage';
import AdminCandidaturesPage from '../pages/admin/AdminCandidaturesPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminAvisModerationPage from '../pages/admin/AdminAvisModerationPage';
import AdminMessagesPage from '../pages/admin/AdminMessagesPage';
import AdminStatistiquesPage from '../pages/admin/AdminStatistiquesPage';
import AdminParametresPage from '../pages/admin/AdminParametresPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/offres" element={<PublicLayout />}>
        <Route index element={<PublicOffresPage />} />
        <Route path=":offerId" element={<PublicOffreDetailPage />} />
      </Route>
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={['candidat']} />}>
        <Route path="/candidat" element={<AppShellLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CandidatDashboard />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="messagerie" element={<MessageriePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="avis" element={<CandidatAvisPage />} />
          <Route path="offres" element={<CandidatOffresPage />} />
          <Route
            path="offres/:offerId"
            element={<OffreDetailPage fallbackPath="/candidat/offres" showApply />}
          />
          <Route path="candidatures" element={<CandidaturesPage />} />
          <Route path="cv" element={<CvPage />} />
          <Route path="support" element={<Navigate to="/contact" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['recruteur']} />}>
        <Route path="/recruteur" element={<AppShellLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruteurDashboard />} />
          <Route path="offres" element={<RecruteurOffresPage />} />
          <Route
            path="offres/:offerId"
            element={<OffreDetailPage fallbackPath="/recruteur/offres" />}
          />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="messagerie" element={<MessageriePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="avis" element={<RecruteurAvisPage />} />
          <Route path="candidatures" element={<CandidaturesPage />} />
          <Route path="support" element={<Navigate to="/contact" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="utilisateurs" element={<AdminUtilisateursPage />} />
          <Route path="offres" element={<AdminOffresPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="candidatures" element={<AdminCandidaturesPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="support" element={<Navigate to="/admin/messages" replace />} />
          <Route path="messagerie" element={<Navigate to="/admin/messages" replace />} />
          <Route path="avis" element={<AdminAvisModerationPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="statistiques" element={<AdminStatistiquesPage />} />
          <Route path="parametres" element={<AdminParametresPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
