import { Loader2, Download } from 'lucide-react';
import AdminModal from './AdminModal';
import UserAvatar from '../common/UserAvatar';
import StatusBadge from '../ui/StatusBadge';
import { downloadApiFile } from '../../utils/downloadFile';

const ROLE_VARIANT = {
  candidat: 'info',
  recruteur: 'primary',
  admin: 'neutral',
};

const ACTION_LABELS = {
  warning: { label: 'Avertissement', variant: 'warning' },
  block: { label: 'Blocage', variant: 'danger' },
  unblock: { label: 'Déblocage', variant: 'success' },
};

export default function AdminUserProfileModal({ open, onClose, profile, loading }) {
  return (
    <AdminModal open={open} onClose={onClose} title="Profil utilisateur" wide>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : profile ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start gap-4">
            <UserAvatar
              key={profile.photo_url || profile.photo_profil || profile.id_user}
              user={profile}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-text-dark">
                {profile.prenom} {profile.nom}
              </h4>
              <p className="text-sm text-text-secondary mt-1">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusBadge label={profile.role} variant={ROLE_VARIANT[profile.role] || 'neutral'} />
                <StatusBadge
                  label={profile.statut_compte === 'blocked' ? 'Bloqué' : 'Actif'}
                  variant={profile.statut_compte === 'blocked' ? 'danger' : 'success'}
                />
              </div>
            </div>
          </div>

          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-bg-page rounded-xl p-3">
              <dt className="text-text-secondary text-xs uppercase tracking-wide">Téléphone</dt>
              <dd className="font-medium text-text-dark mt-1">{profile.telephone || '—'}</dd>
            </div>
            <div className="bg-bg-page rounded-xl p-3">
              <dt className="text-text-secondary text-xs uppercase tracking-wide">Inscription</dt>
              <dd className="font-medium text-text-dark mt-1">{profile.created_at || '—'}</dd>
            </div>
            {profile.entreprise && (
              <div className="bg-bg-page rounded-xl p-3">
                <dt className="text-text-secondary text-xs uppercase tracking-wide">Entreprise</dt>
                <dd className="font-medium text-text-dark mt-1">{profile.entreprise}</dd>
              </div>
            )}
            {profile.ville && (
              <div className="bg-bg-page rounded-xl p-3">
                <dt className="text-text-secondary text-xs uppercase tracking-wide">Ville</dt>
                <dd className="font-medium text-text-dark mt-1">{profile.ville}</dd>
              </div>
            )}
          </dl>

          {profile.cvs?.length > 0 && (
            <section>
              <h5 className="text-sm font-semibold text-text-dark mb-2">CV</h5>
              <ul className="space-y-2">
                {profile.cvs.map((cv) => (
                  <li key={cv.id_cv} className="flex items-center justify-between gap-2 bg-bg-page rounded-xl px-3 py-2 text-sm">
                    <span>{cv.nom_fichier || `CV #${cv.id_cv}`}</span>
                    <button
                      type="button"
                      onClick={() => downloadApiFile(`/cv/${cv.id_cv}/download`, cv.nom_fichier || 'CV.pdf')}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.candidatures?.length > 0 && (
            <section>
              <h5 className="text-sm font-semibold text-text-dark mb-2">Candidatures ({profile.candidatures.length})</h5>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {profile.candidatures.map((c) => (
                  <li key={c.id_candidature} className="flex justify-between gap-2 text-sm bg-bg-page rounded-xl px-3 py-2">
                    <span className="font-medium truncate">{c.offre}</span>
                    <span className="text-text-secondary shrink-0">{c.date_candidature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.offres?.length > 0 && (
            <section>
              <h5 className="text-sm font-semibold text-text-dark mb-2">Offres publiées ({profile.offres.length})</h5>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {profile.offres.map((o) => (
                  <li key={o.id_offre} className="flex justify-between gap-2 text-sm bg-bg-page rounded-xl px-3 py-2">
                    <span className="font-medium truncate">{o.titre}</span>
                    <span className="text-text-secondary shrink-0">{o.date_publication}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h5 className="text-sm font-semibold text-text-dark mb-2">Historique modération</h5>
            {profile.historique_moderation?.length ? (
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {profile.historique_moderation.map((h) => {
                  const meta = ACTION_LABELS[h.action] || { label: h.action, variant: 'neutral' };
                  return (
                    <li key={h.id} className="bg-bg-page rounded-xl px-3 py-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge label={meta.label} variant={meta.variant} />
                        <span className="text-text-secondary text-xs">{h.date_label}</span>
                        {h.admin && <span className="text-xs text-text-secondary">par {h.admin}</span>}
                      </div>
                      {h.message && <p className="text-text-secondary mt-1">{h.message}</p>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary">Aucun avertissement ni blocage enregistré.</p>
            )}
          </section>
        </div>
      ) : (
        <p className="text-center text-text-secondary py-8">Profil introuvable.</p>
      )}
    </AdminModal>
  );
}
