import type {
  FulfillmentStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/features/marketplace/model/useMarketplaceStore';

export type PurchaseKind = 'gym_offer' | 'pt_package';

export interface OperationalPurchaserRecord {
  orderId: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaseKind: PurchaseKind;
  productName: string;
  purchasedAt: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  processingStatus: FulfillmentStatus;
}

export type PurchaserDataState =
  | { state: 'loading' }
  | { state: 'loaded'; data: OperationalPurchaserRecord[] }
  | { state: 'empty' }
  | { state: 'error' };
