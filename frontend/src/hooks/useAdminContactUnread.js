import { useCallback, useEffect, useState } from 'react';
import {
  ADMIN_INBOX_CHANGED,
  fetchAdminContactUnreadCount,
} from '../services/adminContactService';

export function useAdminContactUnread() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const n = await fetchAdminContactUnreadCount();
      setCount(n);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(ADMIN_INBOX_CHANGED, onChange);
    const interval = setInterval(refresh, 30000);
    return () => {
      window.removeEventListener(ADMIN_INBOX_CHANGED, onChange);
      clearInterval(interval);
    };
  }, [refresh]);

  return { count, refresh };
}
