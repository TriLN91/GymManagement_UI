import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getGym, getTrainer, gymOffers, ptPackages } from './marketplaceData';

export type CheckoutSelection =
  | {
      kind: 'gym_offer';
      productId: string;
      includePlus: boolean;
      gymBranchId?: string;
      details?: Partial<CheckoutBreakdown>;
    }
  | {
      kind: 'pt_package';
      productId: string;
      includePlus: false;
      gymBranchId?: string;
      trainerProfileId?: string;
      details?: Partial<CheckoutBreakdown>;
    };

export type PaymentMethod = 'card' | 'bank_transfer';
export type PaymentStatus = 'succeeded' | 'failed';
export type FulfillmentStatus = 'pending_gym_confirmation' | 'trainer_assignment_active';

export interface CheckoutBreakdown {
  title: string;
  providerName: string;
  serviceAmountVnd: number;
  serviceDiscountVnd: number;
  plusAmountVnd: number;
  totalVnd: number;
  uncoveredPlusDays: number;
}

export interface MarketplaceOrder extends CheckoutBreakdown {
  id: string;
  orderNumber?: string;
  selection: CheckoutSelection;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
}

interface MarketplaceState {
  selection: CheckoutSelection | null;
  orders: MarketplaceOrder[];
  currentPlusCoverageDays: number;
  selectGymOffer: (
    offerId: string,
    includePlus?: boolean,
    gymBranchId?: string,
    details?: Partial<CheckoutBreakdown>,
  ) => void;
  selectPtPackage: (
    packageId: string,
    gymBranchId?: string,
    trainerProfileId?: string,
    details?: Partial<CheckoutBreakdown>,
  ) => void;
  setIncludePlus: (includePlus: boolean) => void;
  clearSelection: () => void;
  completeCheckout: (
    method: PaymentMethod,
    backendOrder?: { id: string; orderNumber: string },
  ) => MarketplaceOrder | null;
  recordBackendOrder: (order: MarketplaceOrder) => void;
}

export function resolveCheckout(
  selection: CheckoutSelection | null,
  currentPlusCoverageDays = 0,
): CheckoutBreakdown | null {
  if (!selection) return null;

  if (selection.details?.title && selection.details?.providerName) {
    const serviceAmountVnd = selection.details.serviceAmountVnd ?? 0;
    const serviceDiscountVnd = selection.details.serviceDiscountVnd ?? 0;
    const plusAmountVnd = selection.includePlus ? (selection.details.plusAmountVnd ?? 0) : 0;
    const uncoveredPlusDays = selection.includePlus
      ? (selection.details.uncoveredPlusDays ?? 0)
      : 0;
    const totalVnd =
      selection.details.totalVnd ?? serviceAmountVnd - serviceDiscountVnd + plusAmountVnd;
    return {
      title: selection.details.title,
      providerName: selection.details.providerName,
      serviceAmountVnd,
      serviceDiscountVnd,
      plusAmountVnd,
      uncoveredPlusDays,
      totalVnd,
    };
  }

  if (selection.kind === 'gym_offer') {
    const offer = gymOffers.find((item) => item.id === selection.productId && item.published);
    if (!offer) return null;
    const gym = getGym(offer.gymId);
    if (!gym) return null;
    const uncoveredPlusDays = selection.includePlus
      ? Math.max(0, offer.plusDays - currentPlusCoverageDays)
      : 0;
    const plusAmountVnd =
      offer.plusDays > 0
        ? Math.round((offer.plusPriceVnd * uncoveredPlusDays) / offer.plusDays)
        : 0;
    const serviceAmountVnd = offer.servicePriceVnd;
    return {
      title: offer.name.en,
      providerName: gym.name,
      serviceAmountVnd,
      serviceDiscountVnd: offer.serviceDiscountVnd,
      plusAmountVnd,
      uncoveredPlusDays,
      totalVnd: serviceAmountVnd - offer.serviceDiscountVnd + plusAmountVnd,
    };
  }

  const trainerPackage = ptPackages.find(
    (item) => item.id === selection.productId && item.published,
  );
  if (!trainerPackage) return null;
  const trainer = getTrainer(trainerPackage.trainerId);
  const gym = getGym(trainerPackage.gymId);
  if (!trainer || !gym) return null;
  return {
    title: trainerPackage.name.en,
    providerName: `${trainer.fullName} · ${gym.name}`,
    serviceAmountVnd: trainerPackage.servicePriceVnd,
    serviceDiscountVnd: 0,
    plusAmountVnd: 0,
    uncoveredPlusDays: 0,
    totalVnd: trainerPackage.servicePriceVnd,
  };
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      selection: null,
      orders: [],
      currentPlusCoverageDays: 0,
      selectGymOffer: (offerId, includePlus = true, gymBranchId, details) =>
        set({
          selection: {
            kind: 'gym_offer',
            productId: offerId,
            includePlus,
            gymBranchId,
            details,
          },
        }),
      selectPtPackage: (packageId, gymBranchId, trainerProfileId, details) =>
        set({
          selection: {
            kind: 'pt_package',
            productId: packageId,
            includePlus: false,
            gymBranchId,
            trainerProfileId,
            details,
          },
        }),
      setIncludePlus: (includePlus) =>
        set((state) =>
          state.selection?.kind === 'gym_offer'
            ? { selection: { ...state.selection, includePlus } }
            : state,
        ),
      clearSelection: () => set({ selection: null }),
      completeCheckout: (paymentMethod, backendOrder) => {
        const { selection, currentPlusCoverageDays } = get();
        const breakdown = resolveCheckout(selection, currentPlusCoverageDays);
        if (!selection || !breakdown) return null;
        const order: MarketplaceOrder = {
          ...breakdown,
          id: backendOrder?.id ?? `market-order-${Date.now()}`,
          orderNumber: backendOrder?.orderNumber,
          selection,
          paymentMethod,
          paymentStatus: 'succeeded',
          fulfillmentStatus: 'pending_gym_confirmation',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          selection: null,
          orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
          currentPlusCoverageDays:
            selection.kind === 'gym_offer'
              ? state.currentPlusCoverageDays + breakdown.uncoveredPlusDays
              : state.currentPlusCoverageDays,
        }));
        return order;
      },
      recordBackendOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
        })),
    }),
    { name: 'fit:member-marketplace:v1', version: 1 },
  ),
);
