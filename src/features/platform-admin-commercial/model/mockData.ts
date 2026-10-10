import type { CommissionVersion, PlatformOrder, PlatformSettlement, PlusPricing } from './types';

export const initialCommissionVersions: ReadonlyArray<CommissionVersion> = [
  {
    id: 'commission-2026-10',
    ratePercent: 10,
    effectiveAt: '2026-10-01T00:00:00.000Z',
    createdAt: '2026-09-20T04:00:00.000Z',
  },
  {
    id: 'commission-2026-07',
    ratePercent: 9,
    effectiveAt: '2026-07-01T00:00:00.000Z',
    createdAt: '2026-06-18T04:00:00.000Z',
  },
];
export const initialPlusPricing: PlusPricing = {
  standaloneVnd: 249_000,
  bundledVnd: 199_000,
  partnerVnd: 179_000,
  updatedAt: '2026-10-01T00:00:00.000Z',
};
export const initialPlatformOrders: ReadonlyArray<PlatformOrder> = [
  {
    id: 'FIT-2026-1048',
    purchaserDisplayName: 'Mai Nguyen',
    itemName: '90-day Progress',
    itemKind: 'gym_offer',
    purchasedAt: '2026-09-30T08:45:00.000Z',
    settlementId: 'SET-2026-09',
    orderStatus: 'paid',
    financial: {
      currency: 'VND',
      gymServicePriceVnd: 1_800_000,
      discountVnd: 200_000,
      aiPlusVnd: 249_000,
      commissionVnd: 180_000,
      netReceivedVnd: 1_420_000,
      source: 'backend',
    },
  },
  {
    id: 'FIT-2026-1047',
    purchaserDisplayName: 'Alex Volkov',
    itemName: 'Strength Foundation · 8 sessions',
    itemKind: 'pt_package',
    purchasedAt: '2026-09-29T10:20:00.000Z',
    settlementId: 'SET-2026-09',
    orderStatus: 'paid',
    financial: {
      currency: 'VND',
      gymServicePriceVnd: 3_200_000,
      discountVnd: 0,
      aiPlusVnd: 0,
      commissionVnd: 320_000,
      netReceivedVnd: 2_880_000,
      source: 'backend',
    },
  },
  {
    id: 'FIT-2026-1043',
    purchaserDisplayName: 'Hana Kim',
    itemName: '30-day Flex',
    itemKind: 'gym_offer',
    purchasedAt: '2026-09-25T04:10:00.000Z',
    settlementId: 'SET-2026-09',
    orderStatus: 'paid',
    financial: {
      currency: 'VND',
      gymServicePriceVnd: 750_000,
      discountVnd: 50_000,
      aiPlusVnd: 149_000,
      commissionVnd: 75_000,
      netReceivedVnd: 625_000,
      source: 'backend',
    },
  },
];
export const initialPlatformSettlements: ReadonlyArray<PlatformSettlement> = [
  {
    id: 'SET-2026-09',
    startsAt: '2026-09-01T00:00:00.000Z',
    endsAt: '2026-09-30T23:59:59.999Z',
    orderCount: 3,
    reconciliationStatus: 'reconciled',
    financial: {
      currency: 'VND',
      gymServicePriceVnd: 5_750_000,
      discountVnd: 250_000,
      aiPlusVnd: 398_000,
      commissionVnd: 575_000,
      netReceivedVnd: 4_925_000,
      source: 'backend',
    },
  },
  {
    id: 'SET-2026-08',
    startsAt: '2026-08-01T00:00:00.000Z',
    endsAt: '2026-08-31T23:59:59.999Z',
    orderCount: 11,
    reconciliationStatus: 'reconciled',
    financial: {
      currency: 'VND',
      gymServicePriceVnd: 24_500_000,
      discountVnd: 1_200_000,
      aiPlusVnd: 796_000,
      commissionVnd: 2_450_000,
      netReceivedVnd: 20_850_000,
      source: 'backend',
    },
  },
];
