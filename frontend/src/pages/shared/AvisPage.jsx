import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAvis, postAvis } from '../../services/avisService';
import { fetchCandidatAvisRecruteurs } from '../../services/avisRecruteurService';
import { fetchCandidatOffres } from '../../services/offreService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import PageShell from '../../components/ui/PageShell';
import Card from '../../components/ui/Card';
import SubmitButton from '../../components/auth/SubmitButton';
import EmptyState from '../../components/ui/EmptyState';
import UserAvatar from '../../components/common/UserAvatar';
import StarRating from '../../components/ui/StarRating';

export default function AvisPage() {
  const { user } = useAuth();
  const isCandidat = user?.role === 'candidat';

  const [avisRecruteurs, setAvisRecruteurs] = useState([]);
  const [items, setItems] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ note: 5, commentaire: '', id_offre: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (isCandidat) {
        const [recruteurs, avisList, offresList] = await Promise.all([
          fetchCandidatAvisRecruteurs(),
          fetchAvis(),
          fetchCandidatOffres(),
        ]);
        setAvisRecruteurs(recruteurs);
        setItems(avisList);
        setOffres(offresList);
      } else {
        const avisList = await fetchAvis();
        setItems(avisList);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.role, user?.id_user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.commentaire.trim().length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères.');
      return;
    }
    setSubmitting(true);
    try {
      await postAvis({
        note: Number(form.note),
        commentaire: form.commentaire.trim(),
        id_offre: form.id_offre ? Number(form.id_offre) : undefined,
      });
      setSuccess('Merci pour votre avis !');
      setForm({ note: 5, commentaire: '', id_offre: '' });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isCandidat) {
    return (
      <PageShell
        title="Avis des recruteurs"
        subtitle="Consultez les évaluations reçues et partagez votre expérience sur InJob."
      >
        <Card title={`Évaluations reçues (${avisRecruteurs.length})`}>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : avisRecruteurs.length === 0 ? (
            <EmptyState
              title="Aucun avis de recruteur"
              description="Les recruteurs avec lesquels vous avez interagi pourront laisser une évaluation ici."
            />
          ) : (
            <ul className="space-y-4">
              {avisRecruteurs.map((a) => (
                <li
                  key={a.id}
                  className="p-4 rounded-xl border border-gray-100 bg-bg-page/30 hover:bg-bg-page/60 transition-colors"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <UserAvatar
                      user={{ prenom: a.recruteur_nom }}
                      photoOverride={a.recruteur_photo_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text-dark">
                          {a.entreprise || a.recruteur_nom}
                        </span>
                        <StarRating value={a.note} readOnly size="sm" />
                      </div>
                      {a.offre_titre && (
                        <p className="text-xs text-primary mt-1 font-medium">
                          Offre : {a.offre_titre}
                        </p>
                      )}
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                        {a.commentaire}
                      </p>
                      <p className="text-xs text-text-secondary mt-2">{a.date_label}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Partager mon expérience" className="form-panel">
          <p className="text-sm text-text-secondary mb-4 -mt-2">
            Laissez un avis sur InJob ou sur une offre à laquelle vous avez postulé.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-dark">Note</label>
              <div className="mt-2">
                <StarRating
                  value={form.note}
                  onChange={(n) => setForm((f) => ({ ...f, note: n }))}
                />
              </div>
            </div>

            {offres.length > 0 && (
              <div>
                <label className="text-sm font-medium text-text-dark">
                  Offre concernée (optionnel)
                </label>
                <select
                  value={form.id_offre}
                  onChange={(e) => setForm((f) => ({ ...f, id_offre: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Avis général sur InJob</option>
                  {offres.map((o) => (
                    <option key={o.id_offre} value={o.id_offre}>
                      {o.titre} — {o.recruteur_nom || o.entreprise}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-text-dark">Commentaire</label>
              <textarea
                value={form.commentaire}
                onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))}
                rows={4}
                minLength={10}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Décrivez votre expérience (minimum 10 caractères)…"
              />
            </div>

            <SubmitButton loading={submitting} className="!w-full sm:!w-auto sm:min-w-[220px]">
              {submitting ? 'Publication…' : 'Publier mon avis'}
            </SubmitButton>
          </form>
        </Card>

        {error && (
          <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">{success}</p>
        )}

        <Card title={`Avis de la communauté (${items.length})`}>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="Aucun avis visible" description="Aucun avis public pour le moment." />
          ) : (
            <ul className="space-y-4">
              {items.map((a) => (
                <li
                  key={a.id_avis}
                  className="p-4 rounded-xl border border-gray-100 bg-bg-page/30"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text-dark">{a.auteur}</span>
                    <StarRating value={a.note} readOnly size="sm" />
                  </div>
                  {a.offre_titre && (
                    <p className="text-xs text-primary mt-1 font-medium">Offre : {a.offre_titre}</p>
                  )}
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">{a.commentaire}</p>
                  <p className="text-xs text-text-secondary mt-2">{a.date_label}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PageShell>
    );
  }

  const subtitle =
    user?.role === 'admin'
      ? 'Modération et consultation des avis publiés.'
      : 'Consultation des avis.';

  return (
    <PageShell title="Avis et commentaires" subtitle={subtitle}>
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}
      <Card title={`Avis publiés (${items.length})`}>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Aucun avis visible" description="Aucun avis pour le moment." />
        ) : (
          <ul className="space-y-4">
            {items.map((a) => (
              <li
                key={a.id_avis}
                className="p-4 rounded-xl border border-gray-100 bg-bg-page/30"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text-dark">{a.auteur}</span>
                  <StarRating value={a.note} readOnly size="sm" />
                </div>
                {a.offre_titre && (
                  <p className="text-xs text-primary mt-1 font-medium">Offre : {a.offre_titre}</p>
                )}
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{a.commentaire}</p>
                <p className="text-xs text-text-secondary mt-2">{a.date_label}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}
