import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DASHBOARD_WIDGET_IDS, type DashboardPreferences, type DashboardWidgetId } from './types';

import { STORAGE_KEYS } from '@/shared/config/constants';

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  order: [...DASHBOARD_WIDGET_IDS],
  hidden: [],
};

function isWidgetId(value: unknown): value is DashboardWidgetId {
  return DASHBOARD_WIDGET_IDS.includes(value as DashboardWidgetId);
}

export function normalizeDashboardPreferences(
  preferences?: Partial<DashboardPreferences>,
): DashboardPreferences {
  const suppliedOrder = Array.isArray(preferences?.order)
    ? preferences.order.filter(isWidgetId)
    : [];
  const order = [...new Set([...suppliedOrder, ...DASHBOARD_WIDGET_IDS])] as DashboardWidgetId[];
  const hidden = Array.isArray(preferences?.hidden)
    ? [...new Set(preferences.hidden.filter(isWidgetId))]
    : [];
  return { order, hidden };
}

interface GymOwnerDashboardPreferenceState extends DashboardPreferences {
  applyPreferences: (preferences: DashboardPreferences) => void;
  resetPreferences: () => void;
}

export const useGymOwnerDashboardPreferences = create<GymOwnerDashboardPreferenceState>()(
  persist(
    (set) => ({
      ...DEFAULT_DASHBOARD_PREFERENCES,
      applyPreferences: (preferences) => set(normalizeDashboardPreferences(preferences)),
      resetPreferences: () =>
        set({
          order: [...DEFAULT_DASHBOARD_PREFERENCES.order],
          hidden: [],
        }),
    }),
    {
      name: STORAGE_KEYS.gymOwnerDashboardPreferences,
      version: 1,
      merge: (persisted, current) => ({
        ...current,
        ...normalizeDashboardPreferences(persisted as Partial<DashboardPreferences> | undefined),
      }),
    },
  ),
);
