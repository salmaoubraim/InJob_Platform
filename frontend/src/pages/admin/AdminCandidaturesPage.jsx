import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminPageToolbar from '../../components/admin/AdminPageToolbar';
import AdminIconBtn from '../../components/admin/AdminIconBtn';
import StatusBadge from '../../components/ui/StatusBadge';
import UserAvatar from '../../components/common/UserAvatar';
import { useToast } from '../../context/ToastContext';
import { fetchAdminCandidatures, deleteAdminCandidature } from '../../services/adminService';
import { getCandidatureStatut } from '../../utils/candidatureStatus';
import { downloadApiFile } from '../../utils/downloadFile';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function AdminCandidaturesPage() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminCandidatures({ q, page, per_page: 20 });
      setRows(res.data || []);
      setMeta(res.meta || {});
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminPageShell title={t('applications.title')} subtitle={t('applications.subtitle')}>
      <AdminPageToolbar
        value={q}
        onChange={(v) => { setQ(v); setPage(1); }}
        placeholder="Rechercher candidat ou offre…"
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 auth-card overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-bg-page/50">
                {['Candidat', 'Offre', 'Recruteur', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = getCandidatureStatut(r.statut);
                return (
                  <tr key={r.id_candidature} className="border-b border-gray-50 hover:bg-bg-page/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={r.candidat_user || { prenom: r.candidat }} size="sm" />
                        <span className="font-medium">{r.candidat}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.offre}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={r.recruteur_user || { nom: r.recruteur || r.entreprise }} size="sm" />
                        <span>{r.recruteur || r.entreprise}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge label={st.label} variant={st.variant} /></td>
                    <td className="px-4 py-3 text-text-secondary">{r.date_label}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {r.id_cv && (
                          <AdminIconBtn
                            title="Télécharger CV"
                            onClick={() => downloadApiFile(`/cv/${r.id_cv}/download`, `CV_${r.candidat}.pdf`).catch((e) => toast.error(e.message))}
                          >
                            <Download className="w-4 h-4" />
                          </AdminIconBtn>
                        )}
                        <AdminIconBtn
                          title="Supprimer (abus)"
                          variant="danger"
                          onClick={async () => {
                            if (!window.confirm('Supprimer cette candidature abusive ?')) return;
                            try {
                              await deleteAdminCandidature(r.id_candidature);
                              toast.success('Candidature supprimée.');
                              load();
                            } catch (err) {
                              toast.error(getApiErrorMessage(err));
                            }
                          }}
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
          {rows.length === 0 && <p className="p-8 text-center text-text-secondary">Aucune candidature.</p>}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 border rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
          <span className="px-3 py-2 text-sm">{page}/{meta.last_page}</span>
          <button type="button" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="p-2 border rounded-lg"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </AdminPageShell>
  );
}
