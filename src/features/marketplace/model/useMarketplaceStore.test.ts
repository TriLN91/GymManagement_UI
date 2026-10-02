import { beforeEach, describe, expect, it } from 'vitest';

import { resolveCheckout, useMarketplaceStore } from './useMarketplaceStore';

describe('marketplace checkout', () => {
  beforeEach(() => {
    useMarketplaceStore.setState({
      selection: null,
      orders: [],
      currentPlusCoverageDays: 0,
    });
  });

  it('keeps gym service and Plus values separate', () => {
    const breakdown = resolveCheckout({
      kind: 'gym_offer',
      productId: 'fit-district-90',
      includePlus: true,
    });

    expect(breakdown).toMatchObject({
      serviceAmountVnd: 2_490_000,
      serviceDiscountVnd: 200_000,
      plusAmountVnd: 399_000,
      totalVnd: 2_689_000,
    });
  });

  it('charges Plus only for uncovered days', () => {
    const breakdown = resolveCheckout(
      { kind: 'gym_offer', productId: 'fit-district-90', includePlus: true },
      60,
    );

    expect(breakdown?.uncoveredPlusDays).toBe(30);
    expect(breakdown?.plusAmountVnd).toBe(133_000);
  });

  it('extends existing Plus coverage to the full purchased offer period', () => {
    useMarketplaceStore.setState({ currentPlusCoverageDays: 60 });
    useMarketplaceStore.getState().selectGymOffer('fit-district-90');

    useMarketplaceStore.getState().completeCheckout('card');

    expect(useMarketplaceStore.getState().currentPlusCoverageDays).toBe(90);
  });

  it('activates trainer assignment only after a successful PT purchase', () => {
    useMarketplaceStore.getState().selectPtPackage('linh-foundation-8');

    const order = useMarketplaceStore.getState().completeCheckout('card');

    expect(order).toMatchObject({
      paymentStatus: 'succeeded',
      fulfillmentStatus: 'trainer_assignment_active',
      plusAmountVnd: 0,
    });
    expect(useMarketplaceStore.getState().orders).toHaveLength(1);
  });
});
