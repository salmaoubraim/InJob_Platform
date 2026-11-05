import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useDashboardSearch } from '../../context/DashboardSearchContext';
import JobOfferCard from './JobOfferCard';
import { OFFERS_GRID_CLASS } from '../../constants/offersGrid';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function JobOffersList({
  fetchFn,
  title = 'Offres d\'emploi',
  emptyHint = 'Aucune offre trouvée.',
  renderAction,
  gridClassName = OFFERS_GRID_CLASS,
  maxItems = null,
  countLabel = false,
  useDemoCatalog = false,
  showPublisher = false,
  cardVariant = 'default',
  className = '',
  titleClassName = 'text-lg font-bold text-text-dark',
}) {
  const { query } = useDashboardSearch();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let data = await fetchFn(query);
        if (maxItems != null && Array.isArray(data)) {
          data = data.slice(0, maxItems);
        }
        if (!cancelled) setOffers(data);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Impossible de charger les offres.'));
          setOffers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const t = window.setTimeout(load, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, fetchFn, maxItems]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {title ? (
          <h2 className={titleClassName}>{title}</h2>
        ) : (
          <span className="sr-only">Offres d&apos;emploi</span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {countLabel && !loading && offers.length > 0 && (
            <p className="text-sm text-text-secondary">
              {offers.length} offre{offers.length > 1 ? 's' : ''} publiée{offers.length > 1 ? 's' : ''}
            </p>
          )}
          {query && !useDemoCatalog && (
            <p className="text-sm text-text-secondary flex items-center gap-1">
              <Search className="w-4 h-4" />
              Résultats pour « {query} »
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-error text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          Chargement des offres...
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <p className="text-text-secondary">{emptyHint}</p>
        </div>
      ) : (
        <div className={gridClassName}>
          {offers.map((job) => (
            <JobOfferCard
              key={job.id_offre}
              job={job}
              showPublisher={showPublisher}
              variant={cardVariant}
              action={renderAction ? renderAction(job) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
