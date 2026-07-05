import { useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/shared/config/constants';

export type Theme = 'light' | 'dark' | 'system';

function read(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (window.localStorage.getItem(STORAGE_KEYS.theme) as Theme | null) ?? 'system';
}

function apply(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (next: Theme) => void;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(read);

  useEffect(() => {
    apply(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    }
  }, [theme]);

  return { theme, setTheme: setThemeState };
}