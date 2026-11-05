import { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import JobOffersList from '../offres/JobOffersList';
import { OFFERS_GRID_CLASS } from '../../constants/offersGrid';
import { fetchOffres } from '../../services/offreService';
import LandingApplyButton from './LandingApplyButton';

export default function LandingJobOffers() {
  const { isAuthenticated, user } = useAuth();
  const { openRegister } = useAuthModal();
  const loadOffres = useCallback((q) => fetchOffres(q), []);

  const renderAction = (job) => {
    if (isAuthenticated && user?.role === 'candidat') {
      return (
        <LandingApplyButton offreId={job.id_offre} offreTitre={job.titre} />
      );
    }
    if (isAuthenticated && user?.role !== 'candidat') {
      return (
        <p className="text-xs text-center text-text-secondary py-2">
          Connectez-vous avec un compte candidat pour postuler.
        </p>
      );
    }
    return (
      <button
        type="button"
        onClick={() => openRegister('candidat')}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
      >
        Postuler
      </button>
    );
  };

  return (
    <JobOffersList
      fetchFn={loadOffres}
      gridClassName={OFFERS_GRID_CLASS}
      title=""
      emptyHint="Aucune offre publiée pour le moment. Les recruteurs publient leurs offres sur la plateforme — revenez bientôt."
      renderAction={renderAction}
    />
  );
}
