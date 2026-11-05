/** Notifications démo admin (en attendant table API). */
export const ADMIN_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'inscription',
    titre: 'Nouveau candidat inscrit',
    message: 'Omar A. vient de créer un compte candidat.',
    date: 'Il y a 5 min',
    lien: '/admin/utilisateurs',
  },
  {
    id: 'n2',
    type: 'offre',
    titre: 'Nouvelle offre publiée',
    message: 'Déco Maroc SARL — Peintre en bâtiment (Casablanca).',
    date: 'Il y a 1 h',
    lien: '/admin/offres',
  },
  {
    id: 'n3',
    type: 'candidature',
    titre: 'Candidature reçue',
    message: 'Une candidature pour « Développeur Full Stack ».',
    date: 'Il y a 3 h',
    lien: '/admin/offres',
  },
  {
    id: 'n4',
    type: 'message',
    titre: 'Message signalé',
    message: 'Un échange candidat/recruteur nécessite modération.',
    date: 'Hier',
    lien: '/admin/messagerie',
  },
  {
    id: 'n5',
    type: 'avis',
    titre: 'Nouvel avis en attente',
    message: 'Avis 4 étoiles sur Salon Élégance Rabat.',
    date: 'Hier',
    lien: '/admin/avis',
  },
];

const READ_KEY = 'injob_admin_notifications_read';

export function getReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAsRead(id) {
  const ids = getReadIds();
  if (!ids.includes(id)) {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids, id]));
  }
}

export function markAllAsRead() {
  localStorage.setItem(
    READ_KEY,
    JSON.stringify(ADMIN_NOTIFICATIONS.map((n) => n.id))
  );
}

export function getUnreadCount() {
  const read = getReadIds();
  return ADMIN_NOTIFICATIONS.filter((n) => !read.includes(n.id)).length;
}
