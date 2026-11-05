import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frAdmin from './locales/fr/admin.json';

i18n.use(initReactI18next).init({
  resources: {
    fr: { admin: frAdmin },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'admin',
  ns: ['admin'],
  interpolation: { escapeValue: false },
});

export default i18n;
