export interface CommissionVersion {
  id: string;
  ratePercent: number;
  effectiveAt: string;
  createdAt: string;
}

export interface PlusPricing {
  standaloneVnd: number;
  bundledVnd: number;
  partnerVnd: number;
  updatedAt: string;
}

export interface PlatformFinancialBreakdown {
  currency: 'VND';
  gymServicePriceVnd: number;
  discountVnd: number;
  aiPlusVnd: number;
  commissionVnd: number;
  netReceivedVnd: number;
  source: 'backend';
}

export interface PlatformOrder {
  id: string;
  purchaserDisplayName: string;
  itemName: string;
  itemKind: 'gym_offer' | 'pt_package';
  purchasedAt: string;
  settlementId: string;
  orderStatus: 'paid' | 'refunded';
  financial: PlatformFinancialBreakdown;
}

export interface PlatformSettlement {
  id: string;
  startsAt: string;
  endsAt: string;
  orderCount: number;
  reconciliationStatus: 'reconciled' | 'in_review';
  financial: PlatformFinancialBreakdown;
}
