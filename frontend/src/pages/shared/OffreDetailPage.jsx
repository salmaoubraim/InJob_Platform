import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getDemoOfferById } from '../../constants/demoCatalog';
import { fetchOffreById } from '../../services/offreService';
import { isDemoOfferId } from '../../utils/offerIds';
import OffreDetailView from '../../components/offres/OffreDetailView';

export default function OffreDetailPage({ fallbackPath = '/offres', showApply = false }) {
  const { offerId } = useParams();
  const location = useLocation();
  const stateOffer = location.state?.offer;
  const demoOffer = getDemoOfferById(offerId);

  const [offer, setOffer] = useState(stateOffer || demoOffer || null);
  const [loading, setLoading] = useState(!stateOffer && !demoOffer && !isDemoOfferId(offerId));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (stateOffer || demoOffer || isDemoOfferId(offerId)) {
      setOffer(stateOffer || demoOffer);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetchOffreById(offerId)
      .then((data) => {
        if (!cancelled) {
          setOffer(data);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOffer(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [offerId, stateOffer, demoOffer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-text-secondary">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        Chargement de l&apos;offre…
      </div>
    );
  }

  if (!offer || notFound) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <OffreDetailView offer={offer} showApply={showApply} />;
}
