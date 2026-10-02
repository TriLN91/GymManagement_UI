import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enCoaching from './locales/en/coaching.json';
import enCommon from './locales/en/common.json';
import enErrors from './locales/en/errors.json';
import enWorkout from './locales/en/workout.json';
import viAuth from './locales/vi/auth.json';
import viCoaching from './locales/vi/coaching.json';
import viCommon from './locales/vi/common.json';
import viErrors from './locales/vi/errors.json';
import viWorkout from './locales/vi/workout.json';

import { STORAGE_KEYS } from '@/shared/config/constants';
import { env } from '@/shared/config/env';

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language.startsWith('vi') ? 'vi' : 'en';
}

i18n.on('languageChanged', syncDocumentLanguage);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        auth: enAuth,
        common: enCommon,
        coaching: enCoaching,
        errors: enErrors,
        workout: enWorkout,
      },
      vi: {
        auth: viAuth,
        common: viCommon,
        coaching: viCoaching,
        errors: viErrors,
        workout: viWorkout,
      },
    },
    lng: localStorage.getItem(STORAGE_KEYS.locale) ?? env.VITE_DEFAULT_LOCALE,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'coaching', 'errors', 'workout'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.locale,
      caches: ['localStorage'],
    },
  })
  .then(() => syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language));

export default i18n;
