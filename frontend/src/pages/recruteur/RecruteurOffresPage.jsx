import { useCallback, useState } from 'react';
import PageShell from '../../components/ui/PageShell';
import JobOffersList from '../../components/offres/JobOffersList';
import OfferDetailButton from '../../components/offres/OfferDetailButton';
import { OFFERS_GRID_CLASS } from '../../constants/offersGrid';
import RecruteurPublishOffer from '../../components/offres/RecruteurPublishOffer';
import RecruteurOfferActions from '../../components/offres/RecruteurOfferActions';
import { fetchRecruteurOffres, publishOffre } from '../../services/offreService';

export default function RecruteurOffresPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingOffer, setEditingOffer] = useState(null);

  const handleEditOffer = (job) => {
    setEditingOffer(job);
    window.requestAnimationFrame(() => {
      document.getElementById('recruteur-offer-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const loadOffres = useCallback(
    (q) => fetchRecruteurOffres(q),
    [refreshKey]
  );

  const handlePublishDraft = async (job) => {
    await publishOffre(job.id_offre);
    setRefreshKey((k) => k + 1);
  };

  return (
    <PageShell
      title="Gestion des offres"
      subtitle="Publiez et gérez vos annonces visibles par les candidats."
    >
      <div className="form-panel">
        <RecruteurPublishOffer
          editingOffer={editingOffer}
          onCancelEdit={() => setEditingOffer(null)}
          onPublished={() => {
            setEditingOffer(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      </div>

      <JobOffersList
        key={refreshKey}
        fetchFn={loadOffres}
        gridClassName={OFFERS_GRID_CLASS}
        cardVariant="landing"
        title="Offres d'emploi"
        titleClassName="text-xl sm:text-2xl font-bold text-text-dark"
        emptyHint="Vous n'avez pas encore publié d'offre."
        renderAction={(job) => (
          <div className="space-y-2">
            <OfferDetailButton job={job} basePath="/recruteur/offres" />
            {job.est_publie ? (
              <span className="inline-block w-full text-center py-2 rounded-xl text-xs font-semibold bg-[#ECFDF5] text-success">
                Publiée — visible candidats
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handlePublishDraft(job)}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Publier maintenant
              </button>
            )}
            <RecruteurOfferActions
              job={job}
              onEdit={handleEditOffer}
              onChanged={() => setRefreshKey((k) => k + 1)}
            />
          </div>
        )}
      />
    </PageShell>
  );
}
