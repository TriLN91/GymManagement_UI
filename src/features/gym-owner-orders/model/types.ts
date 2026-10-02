import type {
  FulfillmentStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/features/marketplace/model/useMarketplaceStore';

export type CommercialItemKind = 'gym_offer' | 'pt_package';
export type RequestKind = 'refund' | 'dispute';

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface BackendFinancialBreakdown {
  currency: 'VND';
  gymServicePriceVnd: number;
  discountVnd: number;
  aiPlusVnd: number;
  commissionVnd: number;
  netReceivedVnd: number;
  source: 'backend';
}

export interface GymOwnerOrderRecord {
  id: string;
  purchaserDisplayName: string;
  itemKind: CommercialItemKind;
  itemName: string;
  purchasedAt: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  settlementPeriodId: string;
  financial: BackendFinancialBreakdown;
}

export interface BackendReconciliationState {
  code: string;
  label: LocalizedText;
}

export interface SettlementPeriodRecord {
  id: string;
  startsAt: string;
  endsAt: string;
  orderCount: number;
  reconciliation: BackendReconciliationState;
  financial: BackendFinancialBreakdown;
}

export interface RefundDisputeRequestDraft {
  kind: RequestKind;
  details: string;
}

export interface SubmittedRefundDisputeRequest extends RefundDisputeRequestDraft {
  id: string;
  orderId: string;
  submittedAt: string;
}

export type CommerceDataState<T> =
  | { state: 'loading' }
  | { state: 'loaded'; data: T }
  | { state: 'empty' }
  | { state: 'error'; message?: string };
