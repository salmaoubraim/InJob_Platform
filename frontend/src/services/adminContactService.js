import api from './api';

function withParams(path, params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  return api.get(path, { params: clean });
}

export async function fetchAdminContactMessages(params) {
  const { data } = await withParams('/admin/contact-messages', params);
  return data;
}

export async function fetchAdminContactUnreadCount() {
  const { data } = await api.get('/admin/contact-messages/unread-count');
  return data.count ?? 0;
}

export const ADMIN_INBOX_CHANGED = 'admin-inbox-changed';

export function notifyAdminInboxChanged() {
  window.dispatchEvent(new CustomEvent(ADMIN_INBOX_CHANGED));
}

export async function fetchAdminContactMessage(id) {
  const { data } = await api.get(`/admin/contact-messages/${id}`);
  return data.data;
}

export async function replyAdminContactMessage(id, reponse) {
  const { data } = await api.post(`/admin/contact-messages/${id}/reply`, { reponse });
  return data;
}

export async function updateAdminContactReply(id, reponse) {
  const { data } = await api.patch(`/admin/contact-messages/${id}/reply`, { reponse });
  return data;
}

export async function clearAdminContactReply(id) {
  const { data } = await api.delete(`/admin/contact-messages/${id}/reply`);
  return data;
}

export async function deleteAdminContactMessage(id) {
  const { data } = await api.delete(`/admin/contact-messages/${id}`);
  return data;
}

/** Supprime tous les messages contact (pas utilisé par l’icône gomme). */
export async function deleteAllAdminContactMessages() {
  const { data } = await api.delete('/admin/contact-messages');
  return data;
}

export async function markAdminContactRead(email) {
  const { data } = await api.post('/admin/contact-messages/mark-read', { email });
  return data;
}

export async function clearAllAdminContactReplies() {
  const { data } = await api.delete('/admin/contact-messages/replies');
  return data;
}

export async function clearAdminContactReplies(email) {
  const { data } = await api.delete('/admin/contact-messages/contact-replies', {
    params: { email },
  });
  return data;
}
