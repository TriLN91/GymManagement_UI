import { create } from 'zustand';

import {
  initialCommissionVersions,
  initialPlatformOrders,
  initialPlatformSettlements,
  initialPlusPricing,
} from './mockData';
import type { CommissionVersion, PlatformOrder, PlatformSettlement, PlusPricing } from './types';

import { usePlatformApprovalStore } from '@/features/platform-admin-approvals/model/store';

interface CommercialState {
  commissionVersions: ReadonlyArray<CommissionVersion>;
  plusPricing: PlusPricing;
  orders: ReadonlyArray<PlatformOrder>;
  settlements: ReadonlyArray<PlatformSettlement>;
  addCommissionVersion: (ratePercent: number, effectiveAt: string) => boolean;
  updatePlusPricing: (pricing: Omit<PlusPricing, 'updatedAt'>) => boolean;
}

export const usePlatformCommercialStore = create<CommercialState>((set) => ({
  commissionVersions: initialCommissionVersions,
  plusPricing: initialPlusPricing,
  orders: initialPlatformOrders,
  settlements: initialPlatformSettlements,
  addCommissionVersion: (ratePercent, effectiveAt) => {
    if (!Number.isFinite(ratePercent) || ratePercent < 0 || !effectiveAt) return false;
    const effective = new Date(effectiveAt);
    if (Number.isNaN(effective.getTime()) || effective <= new Date()) return false;
    const id = `commission-${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString();
    set((state) => ({
      commissionVersions: [
        { id, ratePercent, effectiveAt: effective.toISOString(), createdAt },
        ...state.commissionVersions,
      ],
    }));
    usePlatformApprovalStore.getState().recordAudit({
      action: 'commercial_configuration_updated',
      subjectType: 'commercial_configuration',
      subjectId: id,
      metadata: {
        toStatus: `commission:${ratePercent}`,
        note: `Effective ${effective.toISOString()}`,
      },
    });
    return true;
  },
  updatePlusPricing: (pricing) => {
    if (
      Object.values(pricing).some((value) => !Number.isFinite(value) || value < 0) ||
      pricing.bundledVnd > pricing.standaloneVnd ||
      pricing.partnerVnd > pricing.standaloneVnd
    )
      return false;
    const updatedAt = new Date().toISOString();
    set({ plusPricing: { ...pricing, updatedAt } });
    usePlatformApprovalStore.getState().recordAudit({
      action: 'commercial_configuration_updated',
      subjectType: 'commercial_configuration',
      subjectId: 'plus-pricing',
      metadata: { toStatus: 'plus-pricing' },
    });
    return true;
  },
}));
