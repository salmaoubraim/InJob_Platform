import { Navigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOffersPathForRole } from '../utils/offersNavigation';
import PageShell from '../components/ui/PageShell';
import JobOffersList from '../components/offres/JobOffersList';
import { LANDING_OFFERS_GRID_CLASS } from '../constants/offersGrid';
import { LANDING_OFFERS_LIMIT } from '../services/offreService';
import { DEMO_LANDING_OFFERS } from '../constants/demoCatalog';
import OfferDetailButton from '../components/offres/OfferDetailButton';

export default function PublicOffresPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const loadOffres = useCallback(() => Promise.resolve(DEMO_LANDING_OFFERS), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    return <Navigate to={getOffersPathForRole(user.role)} replace />;
  }

  return (
    <PageShell title="Offres d'emploi">
      <JobOffersList
        fetchFn={loadOffres}
        maxItems={LANDING_OFFERS_LIMIT}
        gridClassName={LANDING_OFFERS_GRID_CLASS}
        title=""
        useDemoCatalog
        emptyHint="Aucune offre disponible pour le moment."
        cardVariant="landing"
        renderAction={(job) => <OfferDetailButton job={job} />}
      />
    </PageShell>
  );
}
