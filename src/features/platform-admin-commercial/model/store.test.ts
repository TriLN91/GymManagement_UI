import { beforeEach, describe, expect, it } from 'vitest';

import {
  initialCommissionVersions,
  initialPlatformOrders,
  initialPlatformSettlements,
  initialPlusPricing,
} from './mockData';
import { usePlatformCommercialStore } from './store';

describe('Platform commercial store', () => {
  beforeEach(() => {
    usePlatformCommercialStore.setState({
      commissionVersions: initialCommissionVersions,
      plusPricing: initialPlusPricing,
      orders: initialPlatformOrders,
      settlements: initialPlatformSettlements,
    });
  });

  it('creates a versioned commission only for a future effective date', () => {
    expect(usePlatformCommercialStore.getState().addCommissionVersion(11, '2020-01-01T00:00')).toBe(
      false,
    );
    expect(usePlatformCommercialStore.getState().addCommissionVersion(11, '2030-01-01T00:00')).toBe(
      true,
    );
    expect(usePlatformCommercialStore.getState().commissionVersions[0]).toMatchObject({
      ratePercent: 11,
    });
  });

  it('does not allow bundled or partner Plus pricing to exceed standalone pricing', () => {
    expect(
      usePlatformCommercialStore.getState().updatePlusPricing({
        standaloneVnd: 249_000,
        bundledVnd: 250_000,
        partnerVnd: 179_000,
      }),
    ).toBe(false);
    expect(
      usePlatformCommercialStore.getState().updatePlusPricing({
        standaloneVnd: 249_000,
        bundledVnd: 199_000,
        partnerVnd: 179_000,
      }),
    ).toBe(true);
  });
});
