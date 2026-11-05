import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCheck, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminSearchBar from '../../components/admin/AdminSearchBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../services/notificationService';
import { getApiErrorMessage } from '../../utils/apiErrors';

const ADMIN_TYPES = new Set(['inscription', 'offre', 'candidature', 'contact', 'avis', 'signalement', 'abus', 'compte', 'systeme', 'avertissement']);

const TYPE_LABELS = {
  inscription: 'Inscription',
  offre: 'Offre',
  candidature: 'Candidature',
  contact: 'Contact',
  avis: 'Avis',
  signalement: 'Signalement',
  abus: 'Abus',
  compte: 'Compte',
  systeme: 'Système',
  avertissement: 'Avertissement',
};

const PRIORITY = {
  inscription: { label: 'Normale', variant: 'info' },
  offre: { label: 'Normale', variant: 'info' },
  candidature: { label: 'Normale', variant: 'info' },
  contact: { label: 'Haute', variant: 'warning' },
  avis: { label: 'Normale', variant: 'info' },
  signalement: { label: 'Haute', variant: 'warning' },
  abus: { label: 'Critique', variant: 'danger' },
  compte: { label: 'Haute', variant: 'warning' },
  systeme: { label: 'Critique', variant: 'danger' },
  avertissement: { label: 'Haute', variant: 'warning' },
};

const PER_PAGE = 15;

export default function AdminNotificationsPage() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [luFilter, setLuFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items: list, unreadCount: count } = await fetchNotifications({ limit: 200 });
      setItems(list);
      setUnreadCount(count);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (!ADMIN_TYPES.has(n.type)) return false;
      if (typeFilter && n.type !== typeFilter) return false;
      if (luFilter === 'lu' && !n.lu) return false;
      if (luFilter === 'non_lu' && n.lu) return false;
      if (q) {
        const hay = `${n.titre} ${n.message}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, typeFilter, luFilter, q]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [q, typeFilter, luFilter]);

  const handleOpen = async (notif) => {
    if (!notif.lu) {
      await markNotificationRead(notif.id_notification);
      setItems((prev) => prev.map((n) => (n.id_notification === notif.id_notification ? { ...n, lu: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.lien) navigate(notif.lien);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Supprimer toutes les notifications ?')) return;
    try {
      await clearAllNotifications();
      toast.success('Notifications supprimées.');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <AdminPageShell
      title={t('notificationsPage.title')}
      subtitle={t('notificationsPage.subtitle')}
      action={unreadCount > 0 ? (
        <button
          type="button"
          onClick={async () => { await markAllNotificationsRead(); load(); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium bg-white"
        >
          <CheckCheck className="w-4 h-4 text-primary" />
          Tout marquer lu ({unreadCount})
        </button>
      ) : null}
    >
      <AdminSearchBar
        layout="toolbar"
        value={q}
        onChange={setQ}
        placeholder="Rechercher une notification…"
        filter={typeFilter}
        onFilterChange={setTypeFilter}
        filterOptions={[
          { value: '', label: 'Tous types' },
          { value: 'inscription', label: 'Inscriptions' },
          { value: 'offre', label: 'Offres' },
          { value: 'candidature', label: 'Candidatures' },
          { value: 'contact', label: 'Contact' },
          { value: 'avis', label: 'Avis' },
          { value: 'signalement', label: 'Signalements' },
          { value: 'abus', label: 'Abus' },
        ]}
        secondaryFilter={luFilter}
        onSecondaryFilterChange={setLuFilter}
        secondaryFilterOptions={[
          { value: '', label: 'Tous statuts' },
          { value: 'non_lu', label: 'Non lues' },
          { value: 'lu', label: 'Lues' },
        ]}
        trailing={items.length > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            title="Vider la page"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-text-secondary hover:text-error hover:bg-red-50 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      />

      {loading ? (
        <p className="text-center py-16 text-text-secondary">Chargement…</p>
      ) : pageItems.length === 0 ? (
        <p className="text-center py-16 text-text-secondary">Aucune notification de supervision.</p>
      ) : (
        <ul className="space-y-3">
          {pageItems.map((notif) => {
            const prio = PRIORITY[notif.type] || PRIORITY.inscription;
            return (
              <li key={notif.id_notification}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpen(notif)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(notif); }}
                  className={`bg-white rounded-2xl p-5 border auth-card cursor-pointer hover:shadow-md ${!notif.lu ? 'border-primary/30 bg-primary-soft/20' : 'border-gray-100'}`}
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold">{notif.titre}</p>
                        <StatusBadge label={TYPE_LABELS[notif.type] || notif.type} variant="neutral" />
                        <StatusBadge label={prio.label} variant={prio.variant} />
                        {!notif.lu && <span className="text-xs font-semibold text-primary">Non lu</span>}
                      </div>
                      <p className="text-sm text-text-secondary">{notif.message}</p>
                      <p className="text-xs text-primary mt-2">{notif.date_label}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <button type="button" onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('Supprimer ?')) return;
                        try {
                          await deleteNotification(notif.id_notification);
                          load();
                        } catch (err) {
                          toast.error(getApiErrorMessage(err));
                        }
                      }} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {!notif.lu && (
                        <button type="button" onClick={async (e) => {
                          e.stopPropagation();
                          await markNotificationRead(notif.id_notification);
                          load();
                        }} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-soft/50 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lastPage > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 border rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
          <span className="px-3 py-2 text-sm">{page}/{lastPage}</span>
          <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="p-2 border rounded-lg"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </AdminPageShell>
  );
}
