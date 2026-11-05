import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';
import {
  getProfileMenuItems,
  getDisplayName,
  LOGOUT_ITEM,
  ROLE_LABELS,
} from '../../utils/profileMenu';

export default function HeaderUserMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const items = getProfileMenuItems(user?.role);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  const handleLogout = async () => {
    close();
    await logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar
          key={user?.photo_url || user?.photo_profil || 'no-photo'}
          user={user}
          size="sm"
        />
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-semibold text-text-dark capitalize">
            {getDisplayName(user)}
          </p>
          <p className="text-xs text-text-secondary">
            {ROLE_LABELS[user?.role] || user?.role}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-secondary shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/60 py-1.5 z-50"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  close();
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-dark hover:bg-primary-soft hover:text-primary transition-colors"
              >
                <Icon className="w-4 h-4 text-text-secondary shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <div className="my-1.5 border-t border-gray-100" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors text-left"
          >
            <LOGOUT_ITEM.icon className="w-4 h-4 shrink-0" />
            {LOGOUT_ITEM.label}
          </button>
        </div>
      )}
    </div>
  );
}
