export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,}$/;
export const PHONE_MA_REGEX = /^(\+212|0)?[5-7]\d{8}$/;

export function validateEmail(email) {
  if (!email?.trim()) return 'Adresse email requise';
  if (!EMAIL_REGEX.test(email)) return 'Format email invalide';
  return '';
}

export function validateName(value, label = 'Ce champ') {
  if (!value?.trim()) return `${label} requis`;
  if (!NAME_REGEX.test(value.trim())) return `${label} : lettres uniquement (min. 2)`;
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Mot de passe requis';
  if (password.length < 8) return 'Minimum 8 caractères';
  if (!/[A-Z]/.test(password)) return 'Au moins une majuscule';
  if (!/[0-9]/.test(password)) return 'Au moins un chiffre';
  return '';
}

export function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: 'bg-gray-200' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 33, label: 'Faible', color: 'bg-error' };
  if (score <= 4) return { level: 66, label: 'Moyen', color: 'bg-amber-400' };
  return { level: 100, label: 'Fort', color: 'bg-success' };
}

export function validatePhone(phone) {
  if (!phone?.trim()) return '';
  const cleaned = phone.replace(/\s/g, '');
  if (!PHONE_MA_REGEX.test(cleaned)) return 'Numéro marocain invalide (+212 6XX XXX XXX)';
  return '';
}
