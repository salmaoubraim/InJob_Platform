import { useEffect, useMemo, useState } from 'react';
import { Loader2, Trash2, Pencil, UserCheck, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchEligibleCandidats,
  fetchOffresForCandidat,
  fetchRecruteurAvisCandidats,
  fetchRecruteurAvisRecruteursRecus,
  postRecruteurAvisCandidat,
  deleteRecruteurAvisCandidat,
  deleteRecruteurAvisCandidatBulk,
  updateRecruteurAvisCandidat,
  deleteRecruteurAvisRecu,
  deleteRecruteurAvisRecuBulk,
} from '../../services/avisRecruteurService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { useToast } from '../../context/ToastContext';
import PageShell from '../../components/ui/PageShell';
import Card from '../../components/ui/Card';
import SubmitButton from '../../components/auth/SubmitButton';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import UserAvatar from '../../components/common/UserAvatar';
import StarRating from '../../components/ui/StarRating';

export default function RecruteurAvisPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [avisRecus, setAvisRecus] = useState([]);
  const [mesAvis, setMesAvis] = useState([]);
  const [candidats, setCandidats] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOffres, setLoadingOffres] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [selectedRecus, setSelectedRecus] = useState([]);
  const [selectedMesAvis, setSelectedMesAvis] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ note: 5, commentaire: '' });
  const [savingEditId, setSavingEditId] = useState(null);
  const [form, setForm] = useState({
    id_candidat: '',
    id_offre: '',
    note: 5,
    commentaire: '',
  });

  const selectedCandidat = useMemo(
    () => candidats.find((c) => String(c.id_candidat) === String(form.id_candidat)),
    [candidats, form.id_candidat]
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [recus, publies, eligibles] = await Promise.all([
        fetchRecruteurAvisRecruteursRecus(),
        fetchRecruteurAvisCandidats(),
        fetchEligibleCandidats(),
      ]);
      setAvisRecus(recus);
      setMesAvis(publies);
      setCandidats(eligibles);
      setSelectedRecus([]);
      setSelectedMesAvis([]);
      setEditingId(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id_user]);

  useEffect(() => {
    if (!form.id_candidat) {
      setOffres([]);
      setForm((f) => ({ ...f, id_offre: '' }));
      return;
    }

    let cancelled = false;
    setLoadingOffres(true);
    fetchOffresForCandidat(form.id_candidat)
      .then((list) => {
        if (cancelled) return;
        setOffres(list);
        setForm((f) => ({
          ...f,
          id_offre: list.length === 1 ? String(list[0].id_offre) : f.id_offre,
        }));
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingOffres(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.id_candidat]);

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditDraft({ note: 5, commentaire: '' });
  };

  const startInlineEdit = (avis) => {
    setEditingId(avis.id);
    setEditDraft({ note: avis.note, commentaire: avis.commentaire });
    setError('');
    setSuccess('');
  };

  const saveInlineEdit = async (id) => {
    if (editDraft.commentaire.trim().length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères.');
      return;
    }
    setSavingEditId(id);
    setError('');
    try {
      await updateRecruteurAvisCandidat(id, {
        note: Number(editDraft.note),
        commentaire: editDraft.commentaire.trim(),
      });
      toast.success('Évaluation mise à jour.');
      cancelInlineEdit();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingEditId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.id_candidat) {
      setError('Sélectionnez un candidat.');
      return;
    }
    if (!form.id_offre) {
      setError('Sélectionnez l\'offre concernée.');
      return;
    }
    if (form.commentaire.trim().length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères.');
      return;
    }

    setSubmitting(true);
    try {
      await postRecruteurAvisCandidat({
        id_candidat: Number(form.id_candidat),
        id_offre: Number(form.id_offre),
        note: Number(form.note),
        commentaire: form.commentaire.trim(),
      });
      setSuccess('Votre évaluation a été publiée.');
      setForm({ id_candidat: '', id_offre: '', note: 5, commentaire: '' });
      setOffres([]);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMesAvis = async (id) => {
    if (!window.confirm('Supprimer cette évaluation ?')) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteRecruteurAvisCandidat(id);
      toast.success('Évaluation supprimée.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMesAvisBulk = async () => {
    if (selectedMesAvis.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedMesAvis.length} évaluation(s) ?`)) return;
    setClearing(true);
    try {
      await deleteRecruteurAvisCandidatBulk(selectedMesAvis);
      toast.success('Évaluations supprimées.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAvisRecu = async (id) => {
    if (!window.confirm('Supprimer cet avis reçu ?')) return;
    setDeletingId(id);
    try {
      await deleteRecruteurAvisRecu(id);
      toast.success('Avis supprimé.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAvisRecus = async () => {
    if (avisRecus.length === 0) return;
    if (!window.confirm('Vider tous les avis reçus sur vos offres ?')) return;
    setClearing(true);
    try {
      const ids = avisRecus.map((a) => a.id);
      if (ids.length > 0) {
        await deleteRecruteurAvisRecuBulk(ids);
      }
      toast.success('Avis supprimés.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAvisRecusBulk = async () => {
    if (selectedRecus.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedRecus.length} avis sélectionné(s) ?`)) return;
    setClearing(true);
    try {
      await deleteRecruteurAvisRecuBulk(selectedRecus);
      toast.success(`${selectedRecus.length} avis supprimé(s).`);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  return (
    <PageShell
      title="Avis et commentaires"
      subtitle="Évaluez vos candidats et consultez les avis laissés sur vos offres."
    >
      <Card title="Laisser un avis sur un candidat" className="form-panel">
        <p className="text-sm text-text-secondary mb-5 -mt-2">
          Choisissez un candidat ayant postulé à vos offres ou avec lequel vous avez échangé des messages.
        </p>

        {candidats.length === 0 && !loading ? (
          <EmptyState
            title="Aucun candidat éligible"
            description="Les candidats apparaîtront ici après candidature ou échange de messages."
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="candidat-select" className="text-sm font-medium text-text-dark">
                Candidat
              </label>
              <select
                id="candidat-select"
                value={form.id_candidat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, id_candidat: e.target.value, id_offre: '' }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                required
              >
                <option value="">Sélectionner un candidat…</option>
                {candidats.map((c) => (
                  <option key={c.id_candidat} value={c.id_candidat}>
                    {c.nom_complet}
                    {c.poste_recent ? ` — ${c.poste_recent}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedCandidat && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-page/60 border border-gray-100">
                <UserAvatar
                  user={selectedCandidat}
                  photoOverride={selectedCandidat.photo_url}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-dark">{selectedCandidat.nom_complet}</p>
                  {selectedCandidat.poste_recent && (
                    <p className="text-sm text-text-secondary mt-0.5">
                      Dernière candidature : {selectedCandidat.poste_recent}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCandidat.via_candidature && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary-soft/40 px-2 py-0.5 rounded-full">
                        <UserCheck className="w-3 h-3" />
                        A postulé
                      </span>
                    )}
                    {selectedCandidat.via_message && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <MessageCircle className="w-3 h-3" />
                        Échange de messages
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="offre-select" className="text-sm font-medium text-text-dark">
                Offre concernée
              </label>
              {loadingOffres ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement des offres…
                </div>
              ) : (
                <select
                  id="offre-select"
                  value={form.id_offre}
                  onChange={(e) => setForm((f) => ({ ...f, id_offre: e.target.value }))}
                  disabled={!form.id_candidat || offres.length === 0}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white disabled:opacity-50"
                  required
                >
                  <option value="">
                    {form.id_candidat && offres.length === 0
                      ? 'Aucune offre disponible'
                      : 'Sélectionner une offre…'}
                  </option>
                  {offres.map((o) => (
                    <option key={o.id_offre} value={o.id_offre}>
                      {o.titre}
                      {o.ville ? ` — ${o.ville}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-text-dark">Note</label>
              <div className="mt-2">
                <StarRating
                  value={form.note}
                  onChange={(n) => setForm((f) => ({ ...f, note: n }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="commentaire" className="text-sm font-medium text-text-dark">
                Commentaire
              </label>
              <textarea
                id="commentaire"
                value={form.commentaire}
                onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))}
                rows={4}
                minLength={10}
                required
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Décrivez le profil, la prestation en entretien, les compétences observées…"
              />
            </div>

            <SubmitButton loading={submitting} className="!w-full sm:!w-auto sm:min-w-[220px]">
              {submitting ? 'Publication…' : 'Publier l\'évaluation'}
            </SubmitButton>
          </form>
        )}
      </Card>

      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">{success}</p>
      )}

      <Card
        title={`Mes évaluations de candidats (${mesAvis.length})`}
        action={
          mesAvis.length > 0 && selectedMesAvis.length > 0 ? (
            <button
              type="button"
              onClick={handleDeleteMesAvisBulk}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-error bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer ({selectedMesAvis.length})
            </button>
          ) : null
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : mesAvis.length === 0 ? (
          <EmptyState
            title="Aucune évaluation publiée"
            description="Vos avis sur les candidats apparaîtront ici."
          />
        ) : (
          <ul className="space-y-4">
            {mesAvis.map((a) => {
              const isEditing = editingId === a.id;
              return (
              <li
                key={a.id}
                className={`p-4 rounded-xl border transition-colors ${
                  isEditing
                    ? 'border-primary/40 bg-primary-soft/20 ring-2 ring-primary/20'
                    : 'border-gray-100 bg-bg-page/30 hover:bg-bg-page/60'
                }`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMesAvis.includes(a.id)}
                    disabled={isEditing}
                    onChange={() =>
                      setSelectedMesAvis((prev) =>
                        prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]
                      )
                    }
                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                  />
                  <UserAvatar
                    user={{ prenom: a.candidat_nom }}
                    photoOverride={a.candidat_photo_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-text-dark">{a.candidat_nom}</span>
                      {!isEditing && <StarRating value={a.note} readOnly size="sm" />}
                      {isEditing && (
                        <span className="text-xs font-medium text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                          Modification
                        </span>
                      )}
                    </div>
                    {a.offre_titre && (
                      <p className="text-xs text-primary mt-1 font-medium">Offre : {a.offre_titre}</p>
                    )}
                    {isEditing ? (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-text-dark">Note</label>
                          <div className="mt-1">
                            <StarRating
                              value={editDraft.note}
                              onChange={(n) => setEditDraft((d) => ({ ...d, note: n }))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-text-dark">Commentaire</label>
                          <textarea
                            value={editDraft.commentaire}
                            onChange={(e) => setEditDraft((d) => ({ ...d, commentaire: e.target.value }))}
                            rows={3}
                            minLength={10}
                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveInlineEdit(a.id)}
                            disabled={savingEditId === a.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
                          >
                            {savingEditId === a.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : null}
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={cancelInlineEdit}
                            disabled={savingEditId === a.id}
                            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-text-secondary hover:bg-gray-50 disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-text-secondary mt-2 leading-relaxed">{a.commentaire}</p>
                        <p className="text-xs text-text-secondary mt-2">{a.date_label}</p>
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startInlineEdit(a)}
                        className="p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors"
                        title="Modifier"
                        aria-label="Modifier l'évaluation"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMesAvis(a.id)}
                        disabled={deletingId === a.id}
                        className="p-2 rounded-lg text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </Card>

      <Card
        title={`Avis reçus sur mes offres (${avisRecus.length})`}
        action={
          avisRecus.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {selectedRecus.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAvisRecusBulk}
                  disabled={clearing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-error bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer ({selectedRecus.length})
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAvisRecus}
                disabled={clearing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Tout vider
              </button>
            </div>
          ) : null
        }
      >
        <p className="text-sm text-text-secondary mb-4 -mt-1">
          Commentaires laissés par les candidats sur vos offres d&apos;emploi.
        </p>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : avisRecus.length === 0 ? (
          <EmptyState
            title="Aucun avis reçu"
            description="Les candidats pourront laisser un avis après interaction avec vos offres."
          />
        ) : (
          <ul className="space-y-4">
            {avisRecus.map((a) => (
              <li
                key={a.id}
                className="p-4 rounded-xl border border-gray-100 bg-bg-page/30 hover:bg-bg-page/60 transition-colors"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedRecus.includes(a.id)}
                    onChange={() =>
                      setSelectedRecus((prev) =>
                        prev.includes(a.id)
                          ? prev.filter((x) => x !== a.id)
                          : [...prev, a.id]
                      )
                    }
                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <UserAvatar
                    user={{ prenom: a.candidat_nom }}
                    photoOverride={a.candidat_photo_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-text-dark">{a.candidat_nom || 'Candidat'}</span>
                      <StatusBadge label="Candidat" variant="neutral" />
                      <StarRating value={a.note} readOnly size="sm" />
                    </div>
                    {a.offre_titre && (
                      <p className="text-xs text-primary mt-1 font-medium">Offre : {a.offre_titre}</p>
                    )}
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">{a.commentaire}</p>
                    <p className="text-xs text-text-secondary mt-2">{a.date_label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAvisRecu(a.id)}
                    disabled={deletingId === a.id}
                    className="p-2 rounded-lg text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Supprimer"
                    aria-label="Supprimer l'avis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}
