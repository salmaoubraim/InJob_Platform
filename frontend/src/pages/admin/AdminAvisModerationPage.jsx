import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Eye, EyeOff, Loader2, ScanEye, Trash2 } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminSearchBar from '../../components/admin/AdminSearchBar';
import AdminIconBtn from '../../components/admin/AdminIconBtn';
import AdminAvisDetailModal from '../../components/admin/AdminAvisDetailModal';
import StatusBadge from '../../components/ui/StatusBadge';
import StarRating from '../../components/ui/StarRating';
import UserAvatar from '../../components/common/UserAvatar';
import { useToast } from '../../context/ToastContext';
import {
  fetchAdminAvis,
  hideAdminAvis,
  unhideAdminAvis,
  deleteAdminAvis,
  clearAllAdminAvis,
} from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiErrors';

const SENTIMENT = {
  positif: { label: 'Positif', variant: 'success' },
  neutre: { label: 'Neutre', variant: 'warning' },
  negatif: { label: 'Négatif', variant: 'danger' },
};

const TYPE_OPTIONS = [
  { value: '', label: 'Tous types' },
  { value: 'candidat_recruteur', label: 'Candidat → Recruteur' },
  { value: 'recruteur_candidat', label: 'Recruteur → Candidat' },
  { value: 'plateforme', label: 'Plateforme' },
];

export default function AdminAvisModerationPage() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAvis({ q, sentiment: filter, type: typeFilter });
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q, filter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (fn, msg) => {
    try {
      await fn();
      toast.success(msg);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Vider tous les avis de la page de modération ?')) return;
    setClearing(true);
    try {
      const res = await clearAllAdminAvis();
      toast.success(res.message || 'Avis supprimés.');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  return (
    <AdminPageShell title={t('reviews.title')} subtitle={t('reviews.subtitle')}>
      <AdminSearchBar
        value={q}
        onChange={setQ}
        placeholder="Rechercher dans les commentaires…"
        filter={filter}
        onFilterChange={setFilter}
        filterOptions={[
          { value: '', label: 'Tous sentiments' },
          { value: 'positif', label: 'Positifs' },
          { value: 'neutre', label: 'Neutres' },
          { value: 'negatif', label: 'Négatifs' },
        ]}
        secondaryFilter={typeFilter}
        onSecondaryFilterChange={setTypeFilter}
        secondaryFilterOptions={TYPE_OPTIONS}
        trailing={rows.length > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={clearing}
            title="Vider la page"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
          >
            <Eraser className="w-4 h-4" />
          </button>
        ) : null}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <ul className="space-y-4">
          {rows.map((a) => {
            const s = SENTIMENT[a.sentiment] || SENTIMENT.neutre;
            return (
              <li key={`${a.type}-${a.id}`} className={`bg-white rounded-2xl p-5 border auth-card ${a.est_masque ? 'opacity-70 border-dashed' : 'border-gray-100'}`}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <UserAvatar user={a.auteur_user || { prenom: a.auteur }} size="sm" />
                      <span className="font-semibold">{a.auteur}</span>
                      <span className="text-text-secondary text-sm">→ {a.cible}</span>
                      <StatusBadge label={s.label} variant={s.variant} />
                      {a.est_masque && <StatusBadge label="Masqué" variant="danger" />}
                      {a.est_signale && <StatusBadge label="Signalé" variant="warning" />}
                    </div>
                    {a.offre_titre && <p className="text-xs text-primary font-medium">Offre : {a.offre_titre}</p>}
                    <div className="mt-2"><StarRating value={a.note} readOnly size="sm" /></div>
                    <p className="text-sm text-text-secondary mt-2 italic line-clamp-2">« {a.commentaire} »</p>
                    <p className="text-xs text-text-secondary mt-2">{a.date_label}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <AdminIconBtn title="Voir" onClick={() => setDetail(a)}>
                      <Eye className="w-4 h-4" />
                    </AdminIconBtn>
                    {a.est_masque ? (
                      <AdminIconBtn
                        title="Démasquer"
                        variant="success"
                        onClick={() => window.confirm('Démasquer cet avis ? Il redeviendra visible côté utilisateur.') && moderate(() => unhideAdminAvis(a.type, a.id), 'Avis démasqué.')}
                      >
                        <ScanEye className="w-4 h-4" />
                      </AdminIconBtn>
                    ) : (
                      <AdminIconBtn
                        title="Masquer"
                        onClick={() => window.confirm('Masquer cet avis ? Il ne sera plus visible côté utilisateur.') && moderate(() => hideAdminAvis(a.type, a.id), 'Avis masqué.')}
                      >
                        <EyeOff className="w-4 h-4" />
                      </AdminIconBtn>
                    )}
                    <AdminIconBtn
                      title="Supprimer"
                      variant="danger"
                      onClick={() => window.confirm('Supprimer définitivement cet avis ?') && moderate(() => deleteAdminAvis(a.type, a.id), 'Avis supprimé.')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </AdminIconBtn>
                  </div>
                </div>
              </li>
            );
          })}
          {rows.length === 0 && <p className="text-center text-text-secondary py-12">Aucun avis.</p>}
        </ul>
      )}

      <AdminAvisDetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        avis={detail}
      />
    </AdminPageShell>
  );
}
