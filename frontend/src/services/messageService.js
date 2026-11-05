import api from './api';

export async function fetchMessages() {
  const { data } = await api.get('/messages');
  return {
    conversations: data.data || [],
    flat: data.flat || [],
  };
}

export async function fetchMessageContacts() {
  const { data } = await api.get('/messages/contacts');
  return data.data || [];
}

export async function sendMessage(destinataire, contenu) {
  const { data } = await api.post('/messages', { destinataire, contenu });
  return data;
}

export async function markMessagesRead(partnerId) {
  const { data } = await api.post(`/messages/read/${partnerId}`);
  return data;
}

export async function updateMessage(id, contenu) {
  const { data } = await api.put(`/messages/${id}`, { contenu });
  return data;
}

export async function deleteMessage(id) {
  const { data } = await api.delete(`/messages/${id}`);
  return data;
}

export async function clearConversation(partnerId) {
  const { data } = await api.delete(`/messages/conversation/${partnerId}`);
  return data;
}

export async function clearAllMessages() {
  const { data } = await api.delete('/messages/inbox');
  return data;
}
