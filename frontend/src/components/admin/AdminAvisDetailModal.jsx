import AdminModal from './AdminModal';
import StatusBadge from '../ui/StatusBadge';
import StarRating from '../ui/StarRating';

const SENTIMENT = {
  positif: { label: 'Positif', variant: 'success' },
  neutre: { label: 'Neutre', variant: 'warning' },
  negatif: { label: 'Négatif', variant: 'danger' },
};

const TYPE_LABELS = {
  candidat_recruteur: 'Candidat → Recruteur',
  recruteur_candidat: 'Recruteur → Candidat',
  plateforme: 'Plateforme',
};

export default function AdminAvisDetailModal({ open, onClose, avis }) {
  if (!avis) return null;
  const s = SENTIMENT[avis.sentiment] || SENTIMENT.neutre;

  return (
    <AdminModal open={open} onClose={onClose} title="Détail de l'avis" wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={TYPE_LABELS[avis.type] || avis.type} variant="neutral" />
          <StatusBadge label={s.label} variant={s.variant} />
          {avis.est_masque && <StatusBadge label="Masqué" variant="danger" />}
          {avis.est_signale && <StatusBadge label="Signalé" variant="warning" />}
        </div>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-bg-page rounded-xl p-3">
            <dt className="text-xs uppercase tracking-wide text-text-secondary">Auteur</dt>
            <dd className="font-medium mt-1">{avis.auteur}</dd>
          </div>
          <div className="bg-bg-page rounded-xl p-3">
            <dt className="text-xs uppercase tracking-wide text-text-secondary">Cible</dt>
            <dd className="font-medium mt-1">{avis.cible}</dd>
          </div>
        </dl>
        {avis.offre_titre && (
          <p className="text-sm"><span className="text-text-secondary">Offre :</span> <span className="font-medium text-primary">{avis.offre_titre}</span></p>
        )}
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Note</p>
          <StarRating value={avis.note} readOnly size="md" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Commentaire</p>
          <p className="text-sm text-text-dark leading-relaxed bg-bg-page rounded-xl p-4 italic">
            « {avis.commentaire} »
          </p>
        </div>
        <p className="text-xs text-text-secondary">Publié {avis.date_label}</p>
      </div>
    </AdminModal>
  );
}
