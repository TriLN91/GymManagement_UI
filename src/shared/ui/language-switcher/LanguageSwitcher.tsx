import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { STORAGE_KEYS } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const next = i18n.language.startsWith('vi') ? 'en' : 'vi';

  const onClick = () => {
    void i18n.changeLanguage(next);
    window.localStorage.setItem(STORAGE_KEYS.locale, next);
  };

  return (
    <Button variant="ghost" size="icon" aria-label={t('switchLanguage')} onClick={onClick}>
      <Globe className="h-4 w-4" />
    </Button>
  );
}
