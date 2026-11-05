import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationBell({ className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const notifPath = user ? `/${user.role}/notifications` : null;
  const { items, unreadCount, markRead, refresh } = useNotifications();

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleOpenItem = async (notif) => {
    if (!notif.lu) await markRead(notif.id_notification);
    setOpen(false);
    if (notif.lien) navigate(notif.lien);
    else if (notifPath) navigate(notifPath);
  };

  const unreadItems = items.filter((n) => !n.lu);
  const preview = unreadItems.slice(0, 4);

  if (!notifPath) return null;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-lg border transition-colors shrink-0 ${
          open
            ? 'border-primary bg-primary-soft'
            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
        }`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className={`w-5 h-5 ${open ? 'text-primary' : 'text-text-secondary'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-xl z-[100] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-text-dark">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto">
            {preview.length === 0 ? (
              <li className="px-4 py-6 text-sm text-text-secondary text-center">
                {unreadCount === 0 ? 'Aucune notification non lue.' : 'Aucune notification pour le moment.'}
              </li>
            ) : (
              preview.map((notif) => (
                <li key={notif.id_notification}>
                  <button
                    type="button"
                    onClick={() => handleOpenItem(notif)}
                    className={`w-full text-left px-4 py-3 hover:bg-bg-page transition-colors border-b border-gray-50 last:border-0 ${
                      !notif.lu ? 'bg-primary-soft/30' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-text-dark">{notif.titre}</p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-primary mt-1">{notif.date_label}</p>
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="p-3 border-t border-gray-100 bg-bg-page/50">
            <Link
              to={notifPath}
              onClick={() => setOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary-soft transition-colors"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
