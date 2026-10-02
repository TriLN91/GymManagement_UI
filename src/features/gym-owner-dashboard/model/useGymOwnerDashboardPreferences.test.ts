import { beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_DASHBOARD_PREFERENCES,
  normalizeDashboardPreferences,
  useGymOwnerDashboardPreferences,
} from './useGymOwnerDashboardPreferences';

describe('Gym Owner dashboard preferences', () => {
  beforeEach(() => useGymOwnerDashboardPreferences.getState().resetPreferences());

  it('keeps every supported widget once when persisted preferences are incomplete', () => {
    expect(
      normalizeDashboardPreferences({
        order: ['alerts', 'trainers', 'alerts'],
        hidden: ['appointments'],
      }),
    ).toEqual({
      order: ['alerts', 'trainers', 'assignments', 'ptSales', 'appointments'],
      hidden: ['appointments'],
    });
  });

  it('applies visibility and order as one preference update', () => {
    useGymOwnerDashboardPreferences.getState().applyPreferences({
      order: ['alerts', 'appointments', 'ptSales', 'assignments', 'trainers'],
      hidden: ['ptSales'],
    });

    expect(useGymOwnerDashboardPreferences.getState().order[0]).toBe('alerts');
    expect(useGymOwnerDashboardPreferences.getState().hidden).toEqual(['ptSales']);
  });

  it('restores the supported default layout', () => {
    useGymOwnerDashboardPreferences.getState().applyPreferences({
      order: ['alerts', 'appointments', 'ptSales', 'assignments', 'trainers'],
      hidden: ['trainers', 'alerts'],
    });
    useGymOwnerDashboardPreferences.getState().resetPreferences();

    expect(useGymOwnerDashboardPreferences.getState().order).toEqual(
      DEFAULT_DASHBOARD_PREFERENCES.order,
    );
    expect(useGymOwnerDashboardPreferences.getState().hidden).toEqual([]);
  });
});
