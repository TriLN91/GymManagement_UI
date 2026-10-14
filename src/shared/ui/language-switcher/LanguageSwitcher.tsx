import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { STORAGE_KEYS } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

interface LanguageSwitcherProps {
  /** `pill` shows both languages (VI | EN) for public pages; `icon` is the compact portal button. */
  variant?: 'icon' | 'pill';
  className?: string;
}

export function LanguageSwitcher({ variant = 'icon', className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');
  const isVi = i18n.resolvedLanguage === 'vi';
  const next = isVi ? 'en' : 'vi';

  const onClick = () => {
    void i18n.changeLanguage(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.locale, next);
    } catch {
      // Storage can be blocked; the language still changes for this visit.
    }
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={t('switchLanguage')}
        className={cn(
          'border-current/20 inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-bold tracking-wider',
          className,
        )}
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        <span className={isVi ? 'underline underline-offset-4' : 'opacity-50'}>VI</span>
        <span className="opacity-40">|</span>
        <span className={isVi ? 'opacity-50' : 'underline underline-offset-4'}>EN</span>
      </button>
    );
  }

  return (
    <Button variant="ghost" size="icon" aria-label={t('switchLanguage')} onClick={onClick}>
      <Globe className="h-4 w-4" />
    </Button>
  );
}
