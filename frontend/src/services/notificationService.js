import api from './api';

export async function fetchNotifications(params = {}) {
  const { data } = await api.get('/notifications', { params });
  return {
    items: data.data || [],
    unreadCount: data.unread_count ?? 0,
  };
}

export async function fetchUnreadCount() {
  const { data } = await api.get('/notifications/unread-count');
  return data.unread_count ?? 0;
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post('/notifications/read-all');
  return data;
}

export async function deleteNotification(id) {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
}

export async function clearAllNotifications() {
  const { data } = await api.delete('/notifications');
  return data;
}
