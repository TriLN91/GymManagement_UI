import type { PlatformDashboardData } from './types';

// Frontend-only sample. Replace this adapter with a Platform API without changing the UI model.
const sampleDashboard: PlatformDashboardData = {
  approvals: [
    {
      id: 'approval-gym-1042',
      kind: 'gymApplication',
      reference: 'GYM-1042',
      priority: 'attention',
    },
    { id: 'approval-legal-1043', kind: 'legalChange', reference: 'GYM-1043', priority: 'standard' },
    {
      id: 'approval-trainer-2041',
      kind: 'trainerApplication',
      reference: 'TR-2041',
      priority: 'standard',
    },
  ],
  moderation: [
    {
      id: 'moderation-offer-411',
      kind: 'offerListing',
      reference: 'OFF-411',
      priority: 'attention',
    },
    {
      id: 'moderation-trainer-2050',
      kind: 'trainerListing',
      reference: 'TR-2050',
      priority: 'standard',
    },
  ],
  disputes: [
    {
      id: 'dispute-refund-3007',
      kind: 'refundRequest',
      reference: 'CASE-3007',
      priority: 'attention',
    },
    {
      id: 'dispute-order-3011',
      kind: 'orderDispute',
      reference: 'CASE-3011',
      priority: 'standard',
    },
  ],
  alerts: [
    {
      id: 'alert-settlement-881',
      kind: 'settlementException',
      reference: 'SET-881',
      priority: 'critical',
    },
  ],
};

export function loadPlatformDashboard(): Promise<PlatformDashboardData> {
  return Promise.resolve(sampleDashboard);
}
