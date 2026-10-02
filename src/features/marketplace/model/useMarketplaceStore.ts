import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getGym, getTrainer, gymOffers, ptPackages } from './marketplaceData';

export type CheckoutSelection =
  | { kind: 'gym_offer'; productId: string; includePlus: boolean }
  | { kind: 'pt_package'; productId: string; includePlus: false };

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
  selectGymOffer: (offerId: string, includePlus?: boolean) => void;
  selectPtPackage: (packageId: string) => void;
  setIncludePlus: (includePlus: boolean) => void;
  clearSelection: () => void;
  completeCheckout: (method: PaymentMethod) => MarketplaceOrder | null;
}

export function resolveCheckout(
  selection: CheckoutSelection | null,
  currentPlusCoverageDays = 0,
): CheckoutBreakdown | null {
  if (!selection) return null;

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
      selectGymOffer: (offerId, includePlus = true) =>
        set({ selection: { kind: 'gym_offer', productId: offerId, includePlus } }),
      selectPtPackage: (packageId) =>
        set({ selection: { kind: 'pt_package', productId: packageId, includePlus: false } }),
      setIncludePlus: (includePlus) =>
        set((state) =>
          state.selection?.kind === 'gym_offer'
            ? { selection: { ...state.selection, includePlus } }
            : state,
        ),
      clearSelection: () => set({ selection: null }),
      completeCheckout: (paymentMethod) => {
        const { selection, currentPlusCoverageDays } = get();
        const breakdown = resolveCheckout(selection, currentPlusCoverageDays);
        if (!selection || !breakdown) return null;
        const order: MarketplaceOrder = {
          ...breakdown,
          id: `market-order-${Date.now()}`,
          selection,
          paymentMethod,
          paymentStatus: 'succeeded',
          fulfillmentStatus:
            selection.kind === 'pt_package'
              ? 'trainer_assignment_active'
              : 'pending_gym_confirmation',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          selection: null,
          orders: [order, ...state.orders],
          currentPlusCoverageDays:
            selection.kind === 'gym_offer'
              ? state.currentPlusCoverageDays + breakdown.uncoveredPlusDays
              : state.currentPlusCoverageDays,
        }));
        return order;
      },
    }),
    { name: 'fit:member-marketplace:v1', version: 1 },
  ),
);
