import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCheck, Eraser, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../hooks/useNotifications';
import { getApiErrorMessage } from '../../utils/apiErrors';
import PageShell from '../../components/ui/PageShell';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const TYPE_LABELS = {
  candidature: 'Candidature reçue',
  candidature_acceptee: 'Acceptée',
  candidature_refusee: 'Refusée',
  entretien: 'Entretien',
  message: 'Message',
  offre: 'Offre',
  avis: 'Avis',
  inscription: 'Inscription',
};

function NotificationBody({ notif }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-text-dark">{notif.titre}</p>
        {notif.type && (
          <StatusBadge
            label={TYPE_LABELS[notif.type] || notif.type}
            variant="neutral"
          />
        )}
        {!notif.lu && (
          <span className="text-xs font-semibold text-primary">Nouveau</span>
        )}
      </div>
      <p className="text-sm text-text-secondary mt-1">{notif.message}</p>
      <p className="text-xs text-primary mt-2">{notif.date_label}</p>
    </>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { items, unreadCount, loading, markRead, markAllRead, clearAll, remove, refresh } =
    useNotifications();
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const isRecruteur = user?.role === 'recruteur';
  const emptyDescription = isRecruteur
    ? 'Vous serez alerté dès qu\'un candidat postulera à l\'une de vos offres.'
    : 'Vos alertes apparaîtront ici.';

  const handleOpen = async (notif) => {
    if (!notif.lu) await markRead(notif.id_notification);
    if (notif.lien) navigate(notif.lien);
  };

  const handleMarkRead = async (e, notif) => {
    e.stopPropagation();
    if (notif.lu) return;
    try {
      await markRead(notif.id_notification);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (e, notif) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette notification ?')) return;
    setDeletingId(notif.id_notification);
    try {
      await remove(notif.id_notification);
      toast.success('Notification supprimée.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!items.length) return;
    if (!window.confirm('Supprimer toutes les notifications ?')) return;
    setClearing(true);
    try {
      const data = await clearAll();
      toast.success(data.message || 'Notifications supprimées.');
      await refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClearing(false);
    }
  };

  const pageActions = (
    <div className="flex flex-wrap items-center gap-2">
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={async () => {
            await markAllRead();
            refresh();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-text-dark hover:bg-white bg-white transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-primary" />
          Tout marquer comme lu ({unreadCount})
        </button>
      )}
      {items.length > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          disabled={clearing}
          title="Vider les notifications"
          aria-label="Vider les notifications"
          className="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 text-text-secondary hover:text-error hover:bg-red-50 bg-white transition-colors disabled:opacity-50"
        >
          <Eraser className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <PageShell
      title="Notifications"
      subtitle="Restez informé de l'activité sur votre compte."
      action={pageActions}
    >
      {loading && items.length === 0 ? (
        <SkeletonTable rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          description={emptyDescription}
        />
      ) : (
        <>
          {unreadCount > 0 && (
            <p className="text-sm text-text-secondary mb-4">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
            </p>
          )}
          <ul className="space-y-3">
            {items.map((notif) => (
              <li key={notif.id_notification}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpen(notif)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpen(notif);
                    }
                  }}
                  className={`w-full text-left bg-white rounded-2xl p-5 border auth-card hover:shadow-md transition-all cursor-pointer ${
                    !notif.lu ? 'border-primary/30 bg-primary-soft/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <NotificationBody notif={notif} />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, notif)}
                        disabled={deletingId === notif.id_notification}
                        title="Supprimer"
                        aria-label="Supprimer la notification"
                        className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {!notif.lu && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <button
                            type="button"
                            onClick={(e) => handleMarkRead(e, notif)}
                            title="Marquer comme lu"
                            aria-label="Marquer comme lu"
                            className="p-2 rounded-lg text-primary hover:bg-primary-soft transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
