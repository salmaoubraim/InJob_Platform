export function demoDismissedKey(role = 'candidat') {
  return `injob_demo_messaging_dismissed_${role}`;
}

export function isDemoMessagingDismissed(role = 'candidat') {
  return sessionStorage.getItem(demoDismissedKey(role)) === '1';
}

export function dismissDemoMessaging(role = 'candidat') {
  sessionStorage.setItem(demoDismissedKey(role), '1');
}

export const DEMO_CONTACT_IDS = [9001, 2001];
