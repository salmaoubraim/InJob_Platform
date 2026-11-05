import { useCallback } from 'react';
import JobOffersList from '../offres/JobOffersList';
import { LANDING_OFFERS_GRID_CLASS } from '../../constants/offersGrid';
import { LANDING_OFFERS_LIMIT } from '../../services/offreService';
import { DEMO_LANDING_OFFERS } from '../../constants/demoCatalog';
import OfferDetailButton from '../offres/OfferDetailButton';

export default function LandingRecentOffers() {
  const loadOffres = useCallback(() => Promise.resolve(DEMO_LANDING_OFFERS), []);

  return (
    <JobOffersList
      fetchFn={loadOffres}
      maxItems={LANDING_OFFERS_LIMIT}
      gridClassName={`${LANDING_OFFERS_GRID_CLASS} max-w-6xl mx-auto`}
      title=""
      emptyHint="Aucune offre disponible pour le moment."
      renderAction={(job) => <OfferDetailButton job={job} />}
      cardVariant="landing"
      useDemoCatalog
    />
  );
}
