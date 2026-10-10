import { beforeEach, describe, expect, it } from 'vitest';

import {
  initialMarketplaceListings,
  initialPlatformCampaigns,
  initialPlatformNotifications,
} from './mockData';
import { campaignTransitions, usePlatformOperationsStore } from './store';

describe('Platform operations store', () => {
  beforeEach(() => {
    usePlatformOperationsStore.setState({
      listings: initialMarketplaceListings,
      campaigns: initialPlatformCampaigns,
      notifications: initialPlatformNotifications,
    });
  });

  it('requires evidence for restrictive listing actions and allows a restore', () => {
    expect(usePlatformOperationsStore.getState().moderateListing('listing-gym-801', 'hidden')).toBe(
      false,
    );
    expect(
      usePlatformOperationsStore
        .getState()
        .moderateListing('listing-gym-801', 'hidden', 'Policy review required', 'Review needed.'),
    ).toBe(true);
    expect(
      usePlatformOperationsStore.getState().listings.find((item) => item.id === 'listing-gym-801'),
    ).toMatchObject({ status: 'hidden' });
    expect(
      usePlatformOperationsStore.getState().moderateListing('listing-gym-801', 'published'),
    ).toBe(true);
    expect(
      usePlatformOperationsStore.getState().listings.find((item) => item.id === 'listing-gym-801'),
    ).toMatchObject({ status: 'published', restriction: undefined });
  });

  it('uses an explicit campaign transition graph', () => {
    expect(campaignTransitions.draft).toContain('scheduled');
    expect(campaignTransitions.active).toContain('ended');
    expect(campaignTransitions.archived).toHaveLength(0);
    expect(usePlatformOperationsStore.getState().transitionCampaign('campaign-502', 'ended')).toBe(
      true,
    );
    expect(usePlatformOperationsStore.getState().transitionCampaign('campaign-502', 'active')).toBe(
      false,
    );
  });
});
