import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enCoaching from './locales/en/coaching.json';
import enCommon from './locales/en/common.json';
import enErrors from './locales/en/errors.json';
import viAuth from './locales/vi/auth.json';
import viCoaching from './locales/vi/coaching.json';
import viCommon from './locales/vi/common.json';
import viErrors from './locales/vi/errors.json';

import { STORAGE_KEYS } from '@/shared/config/constants';
import { env } from '@/shared/config/env';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { auth: enAuth, common: enCommon, coaching: enCoaching, errors: enErrors },
      vi: { auth: viAuth, common: viCommon, coaching: viCoaching, errors: viErrors },
    },
    lng: localStorage.getItem(STORAGE_KEYS.locale) ?? env.VITE_DEFAULT_LOCALE,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'coaching', 'errors'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.locale,
      caches: ['localStorage'],
    },
  });

export default i18n;