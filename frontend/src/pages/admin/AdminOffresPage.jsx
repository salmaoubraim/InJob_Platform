import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, ScanEye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminSearchBar from '../../components/admin/AdminSearchBar';
import AdminModal from '../../components/admin/AdminModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  fetchAdminOffres,
  fetchAdminOffre,
  hideAdminOffre,
  unhideAdminOffre,
  deleteAdminOffre,
} from '../../services/adminService';
import AdminIconBtn from '../../components/admin/AdminIconBtn';
import UserAvatar from '../../components/common/UserAvatar';
import { getApiErrorMessage } from '../../utils/apiErrors';

const BADGE = {
  active: { label: 'Active', variant: 'success' },
  suspendue: { label: 'Suspendue', variant: 'warning' },
  expiree: { label: 'Expirée', variant: 'neutral' },
  masquee: { label: 'Masquée', variant: 'danger' },
  brouillon: { label: 'Brouillon', variant: 'neutral' },
};

export default function AdminOffresPage() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOffres({ q, statut_offre: filter, page, per_page: 15 });
      setRows(res.data || []);
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q, filter, page]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, msg) => {
    try {
      await fn();
      toast.success(msg);
      setDetail(null);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await fetchAdminOffre(id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <AdminPageShell title={t('offers.title')} subtitle={t('offers.subtitle')}>
      <AdminSearchBar
        value={q}
        onChange={(v) => { setQ(v); setPage(1); }}
        placeholder={t('offers.searchPlaceholder')}
        filter={filter}
        onFilterChange={(v) => { setFilter(v); setPage(1); }}
        filterOptions={[
          { value: '', label: 'Tous statuts' },
          { value: 'active', label: 'Actives' },
          { value: 'suspendue', label: 'Suspendues' },
          { value: 'expiree', label: 'Expirées' },
          { value: 'masquee', label: 'Masquées' },
          { value: 'brouillon', label: 'Brouillons' },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 auth-card overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-bg-page/50">
                {['Titre', 'Entreprise', 'Ville', 'Catégorie', 'Statut', 'Candidatures', 'Publication', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-text-dark">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const b = BADGE[o.statut_badge] || BADGE.brouillon;
                const isHidden = o.est_masquee || o.statut_badge === 'masquee';
                return (
                  <tr key={o.id_offre} className={`border-b border-gray-50 hover:bg-bg-page/30 ${isHidden ? 'opacity-75' : ''}`}>
                    <td className="px-4 py-3 font-medium text-text-dark">{o.titre}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={o.recruteur_user || { nom: o.entreprise }} size="sm" />
                        <span>{o.entreprise}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{o.ville}</td>
                    <td className="px-4 py-3">{o.categorie}</td>
                    <td className="px-4 py-3"><StatusBadge label={b.label} variant={b.variant} /></td>
                    <td className="px-4 py-3">{o.nb_candidatures}</td>
                    <td className="px-4 py-3 text-text-secondary">{o.date_publication}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <AdminIconBtn title="Voir" onClick={() => openDetail(o.id_offre)}>
                          <Eye className="w-4 h-4" />
                        </AdminIconBtn>
                        {isHidden ? (
                          <AdminIconBtn
                            title="Démasquer"
                            variant="success"
                            onClick={() => window.confirm('Démasquer cette offre ? Elle redeviendra visible côté utilisateur.') && act(() => unhideAdminOffre(o.id_offre), 'Offre démasquée.')}
                          >
                            <ScanEye className="w-4 h-4" />
                          </AdminIconBtn>
                        ) : (
                          <AdminIconBtn
                            title="Masquer"
                            onClick={() => window.confirm('Masquer cette offre ? Elle ne sera plus visible côté utilisateur.') && act(() => hideAdminOffre(o.id_offre), 'Offre masquée.')}
                          >
                            <EyeOff className="w-4 h-4" />
                          </AdminIconBtn>
                        )}
                        <AdminIconBtn
                          title="Supprimer"
                          variant="danger"
                          onClick={() => window.confirm('Supprimer définitivement cette offre ?') && act(() => deleteAdminOffre(o.id_offre), 'Offre supprimée.')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </AdminIconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-8 text-center text-text-secondary">Aucune offre.</p>}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-text-secondary">{meta.total} offre(s)</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 py-2">{page} / {meta.last_page}</span>
            <button type="button" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <AdminModal
        open={detailLoading || !!detail}
        onClose={() => { setDetail(null); setDetailLoading(false); }}
        title="Détail de l'offre"
        wide
      >
        {detailLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={BADGE[detail.statut_badge]?.label || detail.statut} variant={BADGE[detail.statut_badge]?.variant || 'neutral'} />
              {detail.est_masquee && <StatusBadge label="Masquée" variant="danger" />}
            </div>
            <h4 className="text-xl font-bold text-text-dark">{detail.titre}</h4>
            <p className="text-sm text-text-secondary">{detail.entreprise} — {detail.ville}</p>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-bg-page rounded-xl p-3">
                <dt className="text-xs uppercase text-text-secondary">Catégorie</dt>
                <dd className="font-medium mt-1">{detail.categorie || '—'}</dd>
              </div>
              <div className="bg-bg-page rounded-xl p-3">
                <dt className="text-xs uppercase text-text-secondary">Candidatures</dt>
                <dd className="font-medium mt-1">{detail.nb_candidatures}</dd>
              </div>
              <div className="bg-bg-page rounded-xl p-3">
                <dt className="text-xs uppercase text-text-secondary">Publication</dt>
                <dd className="font-medium mt-1">{detail.date_publication || '—'}</dd>
              </div>
              <div className="bg-bg-page rounded-xl p-3">
                <dt className="text-xs uppercase text-text-secondary">Expiration</dt>
                <dd className="font-medium mt-1">{detail.date_expiration || '—'}</dd>
              </div>
            </dl>
            {detail.description && (
              <p className="text-sm text-text-secondary leading-relaxed bg-bg-page rounded-xl p-4">{detail.description}</p>
            )}
          </div>
        ) : null}
      </AdminModal>
    </AdminPageShell>
  );
}
