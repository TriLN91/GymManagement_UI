import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { STORAGE_KEYS } from '@/shared/config/constants';
import { env } from '@/shared/config/env';

type Resources = Record<string, Record<string, object>>;

// Every src/i18n/locales/<lang>/<namespace>.json is registered automatically.
const resources: Resources = {};
for (const [file, json] of Object.entries(
  import.meta.glob<object>('./locales/*/*.json', { eager: true, import: 'default' }),
)) {
  const [, lang, namespace] = /^\.\/locales\/(\w+)\/(\w+)\.json$/.exec(file) ?? [];
  if (lang && namespace) (resources[lang] ??= {})[namespace] = json;
}

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language.startsWith('vi') ? 'vi' : 'en';
}

i18n.on('languageChanged', syncDocumentLanguage);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem(STORAGE_KEYS.locale) ?? env.VITE_DEFAULT_LOCALE,
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: Object.keys(resources.vi ?? {}),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.locale,
      caches: ['localStorage'],
    },
  })
  .then(() => syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language));

export default i18n;
