import { useTranslation } from 'react-i18next';

import { LOCALE_TAGS, type Language } from '@/shared/config/constants';

export interface LocaleInfo {
  /** UI language code, also the key of `{ vi, en }` text objects from the API/mocks. */
  language: Language;
  /** BCP 47 tag for `Intl.*` and `toLocale*String`. */
  locale: (typeof LOCALE_TAGS)[Language];
}

export function useLocale(): LocaleInfo {
  const { i18n } = useTranslation();
  const language: Language = i18n.resolvedLanguage?.startsWith('vi') ? 'vi' : 'en';
  return { language, locale: LOCALE_TAGS[language] };
}
