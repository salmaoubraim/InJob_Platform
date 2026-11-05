import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
} from '../services/notificationService';

export function useNotifications({ enabled = true, pollInterval = 15000 } = {}) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled || !isAuthenticated) return;
    setLoading(true);
    try {
      const { items: list, unreadCount: count } = await fetchNotifications();
      setItems(list);
      setUnreadCount(count);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated]);

  const refreshCount = useCallback(async () => {
    if (!enabled || !isAuthenticated) return;
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [enabled, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!pollInterval || !isAuthenticated) return undefined;
    const id = setInterval(refreshCount, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, isAuthenticated, refreshCount]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setItems((prev) =>
      prev.map((n) =>
        n.id_notification === id ? { ...n, lu: true } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, lu: true })));
    setUnreadCount(0);
  };

  const remove = async (id) => {
    const wasUnread = items.find((n) => n.id_notification === id && !n.lu);
    await deleteNotification(id);
    setItems((prev) => prev.filter((n) => n.id_notification !== id));
    if (wasUnread) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const clearAll = async () => {
    const data = await clearAllNotifications();
    setItems([]);
    setUnreadCount(0);
    return data;
  };

  return {
    items,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
    remove,
    clearAll,
  };
}
