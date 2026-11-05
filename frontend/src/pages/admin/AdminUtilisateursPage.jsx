import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Mail,
  Trash2,
  UserCheck,
} from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminPageToolbar from '../../components/admin/AdminPageToolbar';
import AdminIconBtn from '../../components/admin/AdminIconBtn';
import AdminUserProfileModal from '../../components/admin/AdminUserProfileModal';
import AdminWarnModal from '../../components/admin/AdminWarnModal';
import StatusBadge from '../../components/ui/StatusBadge';
import UserAvatar from '../../components/common/UserAvatar';
import { useToast } from '../../context/ToastContext';
import {
  fetchAdminUsers,
  fetchAdminUser,
  suspendAdminUser,
  activateAdminUser,
  warnAdminUser,
  deleteAdminUser,
} from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiErrors';

const ROLE_VARIANT = {
  candidat: 'info',
  recruteur: 'primary',
  admin: 'neutral',
};

export default function AdminUtilisateursPage() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [warnUser, setWarnUser] = useState(null);
  const [warnMessage, setWarnMessage] = useState('');
  const [warnSending, setWarnSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers({ q, role: filter, page, per_page: 20 });
      setRows(res.data || []);
      setMeta(res.meta || {});
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q, filter, page]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => {
    try {
      await fn();
      toast.success(ok);
      load();
      if (profile?.id_user) {
        const updated = await fetchAdminUser(profile.id_user);
        setProfile(updated);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const openProfile = async (id) => {
    setProfileLoading(true);
    setProfile(null);
    try {
      setProfile(await fetchAdminUser(id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleWarn = async () => {
    if (!warnUser || !warnMessage.trim()) return;
    setWarnSending(true);
    try {
      await warnAdminUser(warnUser.id_user, warnMessage.trim());
      toast.success(t('users.warnOk'));
      setWarnUser(null);
      setWarnMessage('');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setWarnSending(false);
    }
  };

  return (
    <AdminPageShell title={t('users.title')} subtitle={t('users.subtitle')}>
      <AdminPageToolbar
        value={q}
        onChange={(v) => { setQ(v); setPage(1); }}
        placeholder={t('users.searchPlaceholder')}
        filter={filter}
        onFilterChange={(v) => { setFilter(v); setPage(1); }}
        filterOptions={[
          { value: '', label: t('users.allRoles') },
          { value: 'candidat', label: t('users.roleCandidate') },
          { value: 'recruteur', label: t('users.roleRecruiter') },
          { value: 'admin', label: t('users.roleAdmin') },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 auth-card overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-bg-page/50">
                {[t('users.columns.user'), t('users.columns.phone'), t('users.columns.role'), t('users.columns.status'), 'Date d\'inscription', t('common.actions')].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isBlocked = u.statut_compte === 'blocked' || u.est_actif === false;
                return (
                  <tr key={u.id_user} className={`border-b border-gray-50 hover:bg-bg-page/30 transition-colors ${isBlocked ? 'opacity-80' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          key={u.photo_url || u.photo_profil || u.id_user}
                          user={u}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-text-dark">{u.prenom} {u.nom}</p>
                          <p className="text-xs text-text-secondary flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{u.telephone || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={u.role} variant={ROLE_VARIANT[u.role] || 'neutral'} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={isBlocked ? 'Bloqué' : 'Actif'}
                        variant={isBlocked ? 'danger' : 'success'}
                      />
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{u.created_at || '—'}</td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <div className="flex items-center gap-0.5">
                          <AdminIconBtn
                            title={t('users.viewProfile')}
                            onClick={() => openProfile(u.id_user)}
                          >
                            <Eye className="w-4 h-4" />
                          </AdminIconBtn>
                          <AdminIconBtn
                            title={t('users.warn')}
                            variant="warning"
                            onClick={() => {
                              setWarnUser(u);
                              setWarnMessage('');
                            }}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </AdminIconBtn>
                          {isBlocked ? (
                            <AdminIconBtn
                              title="Débloquer"
                              variant="success"
                              onClick={() => run(() => activateAdminUser(u.id_user), 'Compte débloqué.')}
                            >
                              <UserCheck className="w-4 h-4" />
                            </AdminIconBtn>
                          ) : (
                            <AdminIconBtn
                              title="Bloquer"
                              variant="warning"
                              onClick={() => window.confirm('Bloquer ce compte ? L\'utilisateur ne pourra plus se connecter.') && run(() => suspendAdminUser(u.id_user), 'Compte bloqué.')}
                            >
                              <Ban className="w-4 h-4" />
                            </AdminIconBtn>
                          )}
                          <AdminIconBtn
                            title={t('common.delete')}
                            variant="danger"
                            onClick={() => window.confirm(t('common.confirmDelete')) && run(() => deleteAdminUser(u.id_user), t('users.deletedOk'))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </AdminIconBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-8 text-center text-text-secondary">{t('common.noData')}</p>}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 border rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="px-3 py-2 text-sm">{page}/{meta.last_page}</span>
          <button type="button" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="p-2 border rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      <AdminUserProfileModal
        open={profileLoading || !!profile}
        onClose={() => { setProfile(null); setProfileLoading(false); }}
        profile={profile}
        loading={profileLoading}
      />

      <AdminWarnModal
        open={!!warnUser}
        onClose={() => { setWarnUser(null); setWarnMessage(''); }}
        userName={warnUser ? `${warnUser.prenom} ${warnUser.nom}` : ''}
        message={warnMessage}
        onChange={setWarnMessage}
        onSubmit={handleWarn}
        sending={warnSending}
      />
    </AdminPageShell>
  );
}
