import { describe, expect, it } from 'vitest';

import { normalizePlatformPreferences } from './usePlatformDashboardPreferences';

describe('Platform dashboard preferences', () => {
  it('keeps a complete unique order and discards obsolete widget ids', () => {
    expect(
      normalizePlatformPreferences({
        order: ['alerts', 'approvals', 'alerts', 'obsolete' as 'alerts'],
        hidden: ['moderation', 'moderation', 'obsolete' as 'alerts'],
      }),
    ).toEqual({
      order: ['alerts', 'approvals', 'moderation', 'disputes'],
      hidden: ['moderation'],
    });
  });
});
