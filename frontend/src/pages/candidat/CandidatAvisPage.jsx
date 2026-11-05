import { useEffect, useMemo, useState } from 'react';
import { Loader2, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCandidatAvisRecruteurs,
  fetchCandidatMesAvisRecruteurs,
  fetchEligibleRecruteursForAvis,
  fetchOffresForRecruteurAvis,
  postCandidatAvisRecruteur,
  deleteCandidatAvisRecruteur,
  deleteCandidatAvisRecruteurBulk,
  updateCandidatAvisRecruteur,
  deleteCandidatAvisRecu,
  deleteCandidatAvisRecuBulk,
} from '../../services/avisRecruteurService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { useToast } from '../../context/ToastContext';
import PageShell from '../../components/ui/PageShell';
import Card from '../../components/ui/Card';
import SubmitButton from '../../components/auth/SubmitButton';
import EmptyState from '../../components/ui/EmptyState';
import UserAvatar from '../../components/common/UserAvatar';
import StarRating from '../../components/ui/StarRating';
import {
  DEMO_CANDIDAT_AVIS_ELIGIBLES,
  demoOffresForRecruteurAvis,
  mergeCandidatAvisEligibles,
  mergeCandidatAvisRecus,
  mergeCandidatMesAvis,
} from '../../constants/demoCatalog';

export default function CandidatAvisPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [avisRecus, setAvisRecus] = useState([]);
  const [mesAvis, setMesAvis] = useState([]);
  const [recruteurs, setRecruteurs] = useState([]);
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
    id_recruteur: '',
    id_offre: '',
    note: 5,
    commentaire: '',
  });

  const selectedRecruteur = useMemo(
    () => recruteurs.find((r) => String(r.id_recruteur) === String(form.id_recruteur)),
    [recruteurs, form.id_recruteur]
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [recus, publies, eligibles] = await Promise.all([
        fetchCandidatAvisRecruteurs(),
        fetchCandidatMesAvisRecruteurs(),
        fetchEligibleRecruteursForAvis(),
      ]);
      setAvisRecus(mergeCandidatAvisRecus(recus));
      setMesAvis(mergeCandidatMesAvis(publies));
      setRecruteurs(mergeCandidatAvisEligibles(eligibles));
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
    if (!form.id_recruteur) {
      setOffres([]);
      setForm((f) => ({ ...f, id_offre: '' }));
      return;
    }

    let cancelled = false;
    setLoadingOffres(true);
    fetchOffresForRecruteurAvis(form.id_recruteur)
      .then((list) => {
        if (cancelled) return;
        let resolved = Array.isArray(list) ? list : [];
        if (resolved.length === 0) {
          resolved = demoOffresForRecruteurAvis(form.id_recruteur);
        }
        if (resolved.length === 0) {
          const rec = recruteurs.find(
            (r) => String(r.id_recruteur) === String(form.id_recruteur)
          );
          const demoRec = DEMO_CANDIDAT_AVIS_ELIGIBLES.find(
            (d) => d.nom_entreprise === rec?.nom_entreprise
          );
          resolved = demoRec?.offres ?? [];
        }
        setOffres(resolved);
        setForm((f) => ({
          ...f,
          id_offre: resolved.length === 1 ? String(resolved[0].id_offre) : f.id_offre,
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
  }, [form.id_recruteur, recruteurs]);

  const isDemoItem = (item) => item?.is_demo || String(item?.id ?? '').startsWith('demo-');

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditDraft({ note: 5, commentaire: '' });
  };

  const startInlineEdit = (avis) => {
    setEditingId(avis.id);
    setEditDraft({ note: avis.note, commentaire: avis.commentaire });
    setSuccess('');
    setError('');
  };

  const saveInlineEdit = async (avis) => {
    if (editDraft.commentaire.trim().length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères.');
      return;
    }
    setSavingEditId(avis.id);
    setError('');
    try {
      if (isDemoItem(avis)) {
        setMesAvis((prev) =>
          prev.map((a) =>
            a.id === avis.id
              ? { ...a, note: Number(editDraft.note), commentaire: editDraft.commentaire.trim() }
              : a
          )
        );
        toast.success('Avis mis à jour.');
      } else {
        await updateCandidatAvisRecruteur(avis.id, {
          note: Number(editDraft.note),
          commentaire: editDraft.commentaire.trim(),
        });
        toast.success('Avis mis à jour.');
        await load();
      }
      cancelInlineEdit();
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

    if (!form.id_recruteur) {
      setError('Sélectionnez un recruteur.');
      return;
    }
    if (!form.id_offre) {
      setError('Sélectionnez une offre concernée.');
      return;
    }
    if (form.commentaire.trim().length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères.');
      return;
    }

    setSubmitting(true);
    try {
      await postCandidatAvisRecruteur({
        id_recruteur: Number(form.id_recruteur),
        id_offre: Number(form.id_offre),
        note: Number(form.note),
        commentaire: form.commentaire.trim(),
      });
      setSuccess('Votre avis a été publié.');
      setForm({ id_recruteur: '', id_offre: '', note: 5, commentaire: '' });
      setOffres([]);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMesAvisBulk = async () => {
    if (selectedMesAvis.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedMesAvis.length} avis ?`)) return;
    setClearing(true);
    try {
      const demoIds = selectedMesAvis.filter((id) =>
        mesAvis.some((a) => a.id === id && isDemoItem(a))
      );
      const apiIds = selectedMesAvis.filter((id) => !demoIds.includes(id));

      if (demoIds.length > 0) {
        setMesAvis((prev) => prev.filter((a) => !demoIds.includes(a.id)));
      }
      if (apiIds.length > 0) {
        await deleteCandidatAvisRecruteurBulk(apiIds);
        await load();
      } else {
        setSelectedMesAvis([]);
      }
      toast.success('Avis supprimés.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (id, item) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    setDeletingId(id);
    try {
      if (isDemoItem(item)) {
        setMesAvis((prev) => prev.filter((a) => a.id !== id));
        toast.success('Avis supprimé.');
        return;
      }
      await deleteCandidatAvisRecruteur(id);
      toast.success('Avis supprimé.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRecu = async (id, item) => {
    if (!window.confirm('Supprimer cette évaluation reçue ?')) return;
    setDeletingId(id);
    try {
      if (isDemoItem(item)) {
        setAvisRecus((prev) => prev.filter((a) => a.id !== id));
        setSelectedRecus((prev) => prev.filter((x) => x !== id));
        toast.success('Évaluation supprimée.');
        return;
      }
      await deleteCandidatAvisRecu(id);
      toast.success('Évaluation supprimée.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRecusBulk = async () => {
    if (selectedRecus.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedRecus.length} évaluation(s) ?`)) return;
    setClearing(true);
    try {
      const demoIds = selectedRecus.filter((id) =>
        avisRecus.some((a) => a.id === id && isDemoItem(a))
      );
      const apiIds = selectedRecus.filter((id) => !demoIds.includes(id));

      if (demoIds.length > 0) {
        setAvisRecus((prev) => prev.filter((a) => !demoIds.includes(a.id)));
      }
      if (apiIds.length > 0) {
        await deleteCandidatAvisRecuBulk(apiIds);
        await load();
      } else {
        setSelectedRecus([]);
      }
      toast.success('Évaluations supprimées.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const handleClearRecus = async () => {
    if (avisRecus.length === 0) return;
    if (!window.confirm('Supprimer toutes les évaluations reçues ?')) return;
    setClearing(true);
    try {
      const apiIds = avisRecus.filter((a) => !isDemoItem(a)).map((a) => a.id);
      setAvisRecus([]);
      setSelectedRecus([]);
      if (apiIds.length > 0) {
        await deleteCandidatAvisRecuBulk(apiIds);
      }
      toast.success('Évaluations supprimées.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  return (
    <PageShell
      title="Avis et commentaires"
      subtitle="Évaluez les recruteurs et les offres auxquelles vous avez postulé."
    >
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">{success}</p>
      )}

      <Card title="Publier un avis" className="form-panel">
        <p className="text-sm text-text-secondary mb-4 -mt-2">
          Choisissez un recruteur et une offre à laquelle vous avez postulé. Les avis généraux ne sont pas autorisés.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-dark">Recruteur</label>
            <select
              value={form.id_recruteur}
              onChange={(e) =>
                setForm((f) => ({ ...f, id_recruteur: e.target.value, id_offre: '' }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Choisir un recruteur</option>
              {recruteurs.map((r) => (
                <option key={r.id_recruteur} value={r.id_recruteur}>
                  {r.nom_entreprise}
                  {r.recruteur_nom ? ` — ${r.recruteur_nom}` : ''}
                  {r.nb_offres_postulees ? ` (${r.nb_offres_postulees} offre${r.nb_offres_postulees > 1 ? 's' : ''})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-text-dark">Offre concernée</label>
            <select
              value={form.id_offre}
              onChange={(e) => setForm((f) => ({ ...f, id_offre: e.target.value }))}
              disabled={!form.id_recruteur || loadingOffres}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50"
              required
            >
              <option value="">
                {loadingOffres ? 'Chargement…' : 'Choisir une offre'}
              </option>
              {offres.map((o) => (
                <option key={o.id_offre} value={o.id_offre}>
                  {o.titre}{o.ville ? ` — ${o.ville}` : ''}
                </option>
              ))}
            </select>
            {selectedRecruteur && offres.length === 0 && !loadingOffres && (
              <p className="text-xs text-text-secondary mt-1">
                Aucune offre postulée chez ce recruteur.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-text-dark">Note</label>
            <div className="mt-2">
              <StarRating value={form.note} onChange={(n) => setForm((f) => ({ ...f, note: n }))} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-dark">Commentaire</label>
            <textarea
              value={form.commentaire}
              onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))}
              rows={4}
              minLength={10}
              required
              placeholder="Expérience de candidature, communication, déroulement du processus, qualité de l'offre…"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-start">
            <SubmitButton loading={submitting} className="!w-auto !h-10 !text-sm px-5">
              Publier mon avis
            </SubmitButton>
          </div>
        </form>
      </Card>

      <Card
        title={`Mes avis publiés (${mesAvis.length})`}
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
            title="Aucun avis publié"
            description="Vous n'avez pas encore commenté un recruteur."
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
                  <UserAvatar user={{ prenom: a.recruteur_nom }} photoOverride={a.recruteur_photo_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-text-dark">{a.entreprise || a.recruteur_nom}</span>
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
                            onClick={() => saveInlineEdit(a)}
                            disabled={savingEditId === a.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
                          >
                            {savingEditId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
                        aria-label="Modifier l'avis"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id, a)}
                        disabled={deletingId === a.id}
                        className="p-2 rounded-lg text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Supprimer"
                        aria-label="Supprimer l'avis"
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
        title={`Évaluations reçues (${avisRecus.length})`}
        action={
          avisRecus.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {selectedRecus.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteRecusBulk}
                  disabled={clearing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-error bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer ({selectedRecus.length})
                </button>
              )}
              <button
                type="button"
                onClick={handleClearRecus}
                disabled={clearing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Tout vider
              </button>
            </div>
          ) : null
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : avisRecus.length === 0 ? (
          <EmptyState
            title="Aucune évaluation reçue"
            description="Les recruteurs avec lesquels vous avez interagi pourront vous évaluer ici."
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
                        prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]
                      )
                    }
                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <UserAvatar user={{ prenom: a.recruteur_nom }} photoOverride={a.recruteur_photo_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-text-dark">{a.entreprise || a.recruteur_nom}</span>
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
                    onClick={() => handleDeleteRecu(a.id, a)}
                    disabled={deletingId === a.id}
                    className="p-2 rounded-lg text-error hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
                    title="Supprimer"
                    aria-label="Supprimer l'évaluation"
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
