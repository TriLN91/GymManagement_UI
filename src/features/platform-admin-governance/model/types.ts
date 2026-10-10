import type { PlatformFinancialBreakdown } from '@/features/platform-admin-commercial/model/types';
export type DisputeStatus =
  'submitted' | 'under_review' | 'need_information' | 'approved' | 'rejected' | 'resolved';
export interface DisputeCase {
  id: string;
  orderId: string;
  gym: string;
  reason: string;
  status: DisputeStatus;
  submittedAt: string;
  evidence: ReadonlyArray<{ id: string; name: string; submittedAt: string }>;
  timeline: ReadonlyArray<{ id: string; at: string; label: string; note?: string }>;
  messages: ReadonlyArray<{ id: string; at: string; author: string; body: string }>;
  financial: PlatformFinancialBreakdown;
}
export interface AnalyticsAggregate {
  range: string;
  gmvVnd: number;
  gymServiceSalesVnd: number;
  commissionVnd: number;
  plusRevenueVnd: number;
  successfulOrders: number;
  comparisonLabel: string;
  comparisonPercent: number;
  source: 'backend';
}
