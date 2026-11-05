import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminPageToolbar from '../../components/admin/AdminPageToolbar';
import { useToast } from '../../context/ToastContext';
import {
  fetchAdminCategories,
  fetchAdminMetiers,
  createAdminCategorie,
  updateAdminCategorie,
  deleteAdminCategorie,
  createAdminMetier,
  updateAdminMetier,
  deleteAdminMetier,
} from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function AdminCategoriesPage() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [q, setQ] = useState('');
  const [mq, setMq] = useState('');
  const [loading, setLoading] = useState(true);
  const [catForm, setCatForm] = useState(null);
  const [metierForm, setMetierForm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, m] = await Promise.all([
        fetchAdminCategories({ q }),
        fetchAdminMetiers({ q: mq }),
      ]);
      setCats(c);
      setMetiers(m);
    } catch {
      setCats([]);
      setMetiers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [q, mq]);

  const saveCat = async () => {
    if (!catForm?.nom_categorie?.trim()) return;
    try {
      if (catForm.id_categorie) {
        await updateAdminCategorie(catForm.id_categorie, { nom_categorie: catForm.nom_categorie, description: catForm.description });
        toast.success(t('categories.updated'));
      } else {
        await createAdminCategorie({ nom_categorie: catForm.nom_categorie, description: catForm.description });
        toast.success(t('categories.created'));
      }
      setCatForm(null);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const saveMetier = async () => {
    if (!metierForm?.nom_metier?.trim() || !metierForm?.id_categorie) return;
    try {
      if (metierForm.id_metier) {
        await updateAdminMetier(metierForm.id_metier, metierForm);
        toast.success(t('categories.metierUpdated'));
      } else {
        await createAdminMetier(metierForm);
        toast.success(t('categories.metierCreated'));
      }
      setMetierForm(null);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <AdminPageShell title={t('categories.title')} subtitle={t('categories.subtitle')}>
      <AdminPageToolbar
        value={q}
        onChange={setQ}
        placeholder={t('categories.searchCategory')}
        actionLabel={t('categories.addCategory')}
        onAction={() => setCatForm({ nom_categorie: '', description: '' })}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 auth-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-bg-page/50">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-text-secondary">{t('categories.colCategory')}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-text-secondary">{t('categories.colOffers')}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-text-secondary">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.id_categorie} className="border-b border-gray-50 hover:bg-bg-page/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-dark">{c.nom_categorie}</p>
                      <p className="text-xs text-text-secondary">{c.description}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{c.nb_offres}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setCatForm(c)} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary-soft text-primary">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={async () => {
                          if (!window.confirm(t('common.confirmDelete'))) return;
                          try {
                            await deleteAdminCategorie(c.id_categorie);
                            toast.success(t('categories.deleted'));
                            load();
                          } catch (err) {
                            toast.error(getApiErrorMessage(err));
                          }
                        }} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 auth-card p-4">
            <AdminPageToolbar
              value={mq}
              onChange={setMq}
              placeholder={t('categories.searchMetier')}
              actionLabel={t('categories.addMetier')}
              onAction={() => setMetierForm({ nom_metier: '', id_categorie: cats[0]?.id_categorie || '', description: '' })}
              className="mb-3"
            />
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {metiers.map((m) => (
                <li key={m.id_metier} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-text-dark">{m.nom_metier}</p>
                    <p className="text-xs text-text-secondary">{m.categorie} · {m.nb_offres} offres</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button type="button" onClick={() => setMetierForm(m)} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary-soft text-primary">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={async () => {
                      if (!window.confirm(t('common.confirmDelete'))) return;
                      try {
                        await deleteAdminMetier(m.id_metier);
                        toast.success(t('categories.metierDeleted'));
                        load();
                      } catch (err) {
                        toast.error(getApiErrorMessage(err));
                      }
                    }} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
              {metiers.length === 0 && <p className="py-8 text-center text-text-secondary">{t('common.noData')}</p>}
            </ul>
          </div>
        </div>
      )}

      {catForm && (
        <Modal title={catForm.id_categorie ? t('categories.editCategory') : t('categories.newCategory')} onClose={() => setCatForm(null)} onSave={saveCat} t={t}>
          <input value={catForm.nom_categorie} onChange={(e) => setCatForm({ ...catForm, nom_categorie: e.target.value })} placeholder={t('categories.name')} className="w-full h-11 rounded-xl border px-3 text-sm" />
          <textarea value={catForm.description || ''} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder={t('categories.description')} rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" />
        </Modal>
      )}

      {metierForm && (
        <Modal title={metierForm.id_metier ? t('categories.editMetier') : t('categories.newMetier')} onClose={() => setMetierForm(null)} onSave={saveMetier} t={t}>
          <input value={metierForm.nom_metier} onChange={(e) => setMetierForm({ ...metierForm, nom_metier: e.target.value })} placeholder={t('categories.metierName')} className="w-full h-11 rounded-xl border px-3 text-sm" />
          <select value={metierForm.id_categorie} onChange={(e) => setMetierForm({ ...metierForm, id_categorie: Number(e.target.value) })} className="w-full h-11 rounded-xl border px-3 text-sm">
            <option value="">{t('categories.selectCategory')}</option>
            {cats.map((c) => <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>)}
          </select>
          <textarea value={metierForm.description || ''} onChange={(e) => setMetierForm({ ...metierForm, description: e.target.value })} placeholder={t('categories.description')} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" />
        </Modal>
      )}
    </AdminPageShell>
  );
}

function Modal({ title, children, onClose, onSave, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 auth-card space-y-3">
        <h3 className="font-bold text-text-dark">{title}</h3>
        {children}
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl border text-sm">{t('common.cancel')}</button>
          <button type="button" onClick={onSave} className="h-11 px-4 rounded-xl bg-primary text-white text-sm font-semibold">{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
}
