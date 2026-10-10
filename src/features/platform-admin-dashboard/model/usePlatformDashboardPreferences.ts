import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  PLATFORM_WIDGET_IDS,
  type PlatformDashboardPreferences,
  type PlatformWidgetId,
} from './types';

const STORAGE_KEY = 'gmc.platformDashboardPreferences';

export const DEFAULT_PLATFORM_PREFERENCES: PlatformDashboardPreferences = {
  order: [...PLATFORM_WIDGET_IDS],
  hidden: [],
};

function isWidgetId(value: unknown): value is PlatformWidgetId {
  return PLATFORM_WIDGET_IDS.includes(value as PlatformWidgetId);
}

export function normalizePlatformPreferences(
  value?: Partial<PlatformDashboardPreferences>,
): PlatformDashboardPreferences {
  const suppliedOrder = Array.isArray(value?.order) ? value.order.filter(isWidgetId) : [];
  const order = [...new Set([...suppliedOrder, ...PLATFORM_WIDGET_IDS])];
  const hidden = Array.isArray(value?.hidden) ? [...new Set(value.hidden.filter(isWidgetId))] : [];
  return { order, hidden };
}

interface PlatformDashboardPreferenceState extends PlatformDashboardPreferences {
  applyPreferences: (preferences: PlatformDashboardPreferences) => void;
  resetPreferences: () => void;
}

export const usePlatformDashboardPreferences = create<PlatformDashboardPreferenceState>()(
  persist(
    (set) => ({
      ...DEFAULT_PLATFORM_PREFERENCES,
      applyPreferences: (preferences) => set(normalizePlatformPreferences(preferences)),
      resetPreferences: () => set({ order: [...DEFAULT_PLATFORM_PREFERENCES.order], hidden: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      merge: (persisted, current) => ({
        ...current,
        ...normalizePlatformPreferences(
          persisted as Partial<PlatformDashboardPreferences> | undefined,
        ),
      }),
    },
  ),
);
