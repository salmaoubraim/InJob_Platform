import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Loader2,
  MessageSquare,
  User,
  Download,
  X,
  Trash2,
  Eraser,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchCandidaturesRecruteur,
  fetchCandidatProfil,
  fetchMesCandidatures,
  updateCandidatureStatut,
  deleteCandidature,
  clearAllCandidatures,
  cancelCandidature,
  clearMyCandidatures,
} from '../../services/candidatureService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { downloadApiFile } from '../../utils/downloadFile';
import PageShell from '../../components/ui/PageShell';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import CandidatureTimeline from '../../components/candidatures/CandidatureTimeline';
import { getCandidatureStatut, CANDIDATURE_STATUTS } from '../../utils/candidatureStatus';
import { DEMO_CANDIDAT_APPLICATIONS } from '../../constants/demoCatalog';

function mapDemoToItems() {
  return DEMO_CANDIDAT_APPLICATIONS.map((c) => ({
    id_candidature: c.id_candidature,
    statut: c.statut,
    date_label: c.date_label,
    date_candidature: c.date_candidature,
    offre: {
      titre: c.offre_titre,
      entreprise: c.recruteur_nom,
      recruteur_nom: c.recruteur_nom,
      ville: c.ville,
      image: c.image,
    },
    recruteur_id_user: null,
  }));
}

export default function CandidaturesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = Number(searchParams.get('id_candidature')) || null;
  const toast = useToast();
  const isRecruteur = user?.role === 'recruteur';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [profil, setProfil] = useState(null);
  const [profilLoading, setProfilLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = isRecruteur
        ? await fetchCandidaturesRecruteur()
        : await fetchMesCandidatures();
      setItems(data.length > 0 ? data : isRecruteur ? [] : mapDemoToItems());
    } catch (err) {
      if (!isRecruteur) {
        setItems(mapDemoToItems());
      } else {
        setError(getApiErrorMessage(err));
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isRecruteur]);

  useEffect(() => {
    if (!highlightId || !items.length) return;
    const el = document.getElementById(`candidature-${highlightId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, items]);

  const handleStatut = async (id, statut) => {
    setUpdatingId(id);
    setError('');
    const previous = items;
    setItems((prev) =>
      prev.map((c) => (c.id_candidature === id ? { ...c, statut } : c))
    );
    try {
      await updateCandidatureStatut(id, statut);
      if (statut === 'entretien_programme') {
        await handleDelete(id, { confirm: false, silent: true });
        toast.success('Entretien programmé — candidature retirée de la liste.');
      } else {
        const st = getCandidatureStatut(statut);
        toast.success(`Statut mis à jour : ${st.label}`);
        await load();
      }
    } catch (err) {
      setItems(previous);
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const isDemoCandidature = (id) => String(id).startsWith('demo-');

  const handleDelete = async (id, { confirm = true, silent = false } = {}) => {
    if (confirm && !window.confirm('Supprimer cette candidature de la liste ?')) return;
    setDeletingId(id);
    setError('');
    const previous = items;
    setItems((prev) => prev.filter((c) => c.id_candidature !== id));
    try {
      if (isDemoCandidature(id)) {
        if (!silent) toast.success('Candidature supprimée.');
        return;
      }
      await deleteCandidature(id);
      if (!silent) {
        toast.success('Candidature supprimée.');
      }
    } catch (err) {
      setItems(previous);
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette candidature ?')) return;
    setDeletingId(id);
    setError('');
    const previous = items;
    setItems((prev) => prev.filter((c) => c.id_candidature !== id));
    try {
      if (isDemoCandidature(id)) {
        toast.success('Candidature annulée.');
        return;
      }
      await cancelCandidature(id);
      toast.success('Candidature annulée.');
    } catch (err) {
      setItems(previous);
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!items.length) return;
    const msg = isRecruteur
      ? 'Supprimer toutes les candidatures de la liste ?'
      : 'Annuler toutes vos candidatures ?';
    if (!window.confirm(msg)) return;
    setClearing(true);
    setError('');
    try {
      if (isRecruteur) {
        const data = await clearAllCandidatures();
        setItems([]);
        toast.success(data.message || 'Liste vidée.');
      } else {
        const demoItems = items.filter((c) => isDemoCandidature(c.id_candidature));
        const apiItems = items.filter((c) => !isDemoCandidature(c.id_candidature));
        setItems([]);
        if (apiItems.length > 0) {
          const data = await clearMyCandidatures();
          toast.success(data.message || 'Candidatures annulées.');
        } else if (demoItems.length > 0) {
          toast.success('Candidatures annulées.');
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      await load();
    } finally {
      setClearing(false);
    }
  };

  const openProfil = async (idCandidat) => {
    setProfilLoading(true);
    try {
      setProfil(await fetchCandidatProfil(idCandidat));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setProfilLoading(false);
    }
  };

  const downloadCv = async (idCv, nom) => {
    try {
      await downloadApiFile(`/cv/${idCv}/download`, nom);
    } catch (err) {
      toast.error(err.message || 'Impossible de télécharger le CV.');
    }
  };

  const contactCandidat = (idUser) => {
    navigate(`/recruteur/messagerie?to=${idUser}`);
  };

  const contactRecruteur = () => {
    navigate('/candidat/messagerie');
  };

  return (
    <PageShell
      title={isRecruteur ? 'Candidatures reçues' : 'Mes candidatures'}
      subtitle={
        isRecruteur
          ? 'Acceptez ou refusez les candidatures, consultez les CV et envoyez un message.'
          : 'Suivez vos candidatures : en attente, acceptée ou refusée.'
      }
      action={
        items.length > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={clearing}
            title={isRecruteur ? 'Vider la liste' : 'Annuler toutes les candidatures'}
            aria-label={isRecruteur ? 'Vider la liste des candidatures' : 'Annuler toutes les candidatures'}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 text-text-secondary hover:text-error hover:bg-red-50 bg-white transition-colors disabled:opacity-50"
          >
            <Eraser className="w-4 h-4" />
          </button>
        ) : null
      }
    >
      {error && (
        <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      {loading ? (
        <SkeletonTable rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title={isRecruteur ? 'Aucune candidature' : 'Aucune candidature envoyée'}
          description={
            isRecruteur
              ? 'Les candidatures apparaîtront ici dès qu\'un candidat postulera.'
              : 'Parcourez les offres et postulez pour démarrer.'
          }
          action={
            !isRecruteur ? (
              <Link
                to="/candidat/offres"
                className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
              >
                Voir les offres
              </Link>
            ) : null
          }
        />
      ) : (
        <ul className="space-y-4">
          {items.map((c) => {
            const statut = getCandidatureStatut(c.statut);
            return (
              <li
                key={c.id_candidature}
                id={`candidature-${c.id_candidature}`}
                className={`bg-white rounded-2xl p-5 border auth-card hover:shadow-md transition-all duration-300 ${
                  highlightId === c.id_candidature
                    ? 'border-primary ring-2 ring-primary/30 shadow-md'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    {c.offre?.image && (
                      <img
                        src={c.offre.image}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-100 hidden sm:block"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-text-dark">{c.offre?.titre}</h3>
                        <StatusBadge label={statut.label} variant={statut.variant} />
                      </div>
                      {c.offre?.entreprise && (
                        <p className="text-sm text-text-secondary mt-1">
                          Recruteur : {c.offre.recruteur_nom || c.offre.entreprise}
                          {c.offre.ville ? ` — ${c.offre.ville}` : ''}
                        </p>
                      )}
                      {isRecruteur && c.candidat && (
                        <p className="text-sm text-text-dark mt-2">
                          {c.candidat.prenom} {c.candidat.nom} — {c.candidat.email}
                        </p>
                      )}
                      <p className="text-xs text-text-secondary mt-2">
                        Postulé le {c.date_label}
                      </p>
                      {!isRecruteur && <CandidatureTimeline statut={c.statut} />}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {isRecruteur && !String(c.id_candidature).startsWith('demo-') && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id_candidature)}
                        disabled={deletingId === c.id_candidature}
                        title="Supprimer la candidature"
                        aria-label="Supprimer la candidature"
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isRecruteur && c.candidat?.id_candidat && (
                      <>
                        <button
                          type="button"
                          onClick={() => openProfil(c.candidat.id_candidat)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-bg-page"
                        >
                          <User className="w-4 h-4" />
                          Profil
                        </button>
                        {c.candidat.a_cv && c.candidat.id_cv && (
                          <button
                            type="button"
                            onClick={() => downloadCv(c.candidat.id_cv, `CV_${c.candidat.prenom}.pdf`)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-bg-page"
                          >
                            <Download className="w-4 h-4" />
                            CV
                          </button>
                        )}
                        {c.candidat.id_user && (
                          <button
                            type="button"
                            onClick={() => contactCandidat(c.candidat.id_user)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-soft text-primary text-sm font-medium"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                        )}
                      </>
                    )}
                    {!isRecruteur && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCancel(c.id_candidature)}
                          disabled={deletingId === c.id_candidature}
                          title="Annuler la candidature"
                          aria-label="Annuler la candidature"
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={contactRecruteur}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-soft text-primary text-sm font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Contacter le recruteur
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isRecruteur && !String(c.id_candidature).startsWith('demo-') && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    {Object.keys(CANDIDATURE_STATUTS).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={updatingId === c.id_candidature}
                        onClick={() => handleStatut(c.id_candidature, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          c.statut === s ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-bg-page'
                        }`}
                      >
                        {CANDIDATURE_STATUTS[s].label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {(profil || profilLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 auth-card max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-text-dark">Profil candidat</h3>
              <button type="button" onClick={() => setProfil(null)} aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {profilLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            ) : profil ? (
              <div className="space-y-3 text-sm">
                <p>
                  <strong>
                    {profil.prenom} {profil.nom}
                  </strong>
                </p>
                <p className="text-text-secondary">{profil.email}</p>
                {profil.ville && <p>Ville : {profil.ville}</p>}
                {profil.competences && <p>Compétences : {profil.competences}</p>}
                {profil.cv?.id_cv && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadCv(profil.cv.id_cv, profil.cv.nom_fichier || 'CV.pdf')
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le CV
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </PageShell>
  );
}
