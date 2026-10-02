import { describe, expect, it } from 'vitest';

import { createOrdersCsv, createSettlementsCsv } from './csvExport';
import { gymOwnerOrderMockResource, gymOwnerSettlementMockResource } from './mockData';

describe('Gym Owner commerce CSV exports', () => {
  it('exports the financial order fields without purchaser personal information', () => {
    expect(gymOwnerOrderMockResource.state).toBe('loaded');
    if (gymOwnerOrderMockResource.state !== 'loaded') return;

    const csv = createOrdersCsv(gymOwnerOrderMockResource.data);
    expect(csv).toContain('gym_service_price');
    expect(csv).toContain('net_received');
    expect(csv).toContain('FIT-2026-1048');
    expect(csv).not.toContain('Mai Nguyen');
    expect(csv).not.toContain('email');
  });

  it('keeps settlement export independent from the order export', () => {
    expect(gymOwnerSettlementMockResource.state).toBe('loaded');
    if (gymOwnerSettlementMockResource.state !== 'loaded') return;

    const csv = createSettlementsCsv(gymOwnerSettlementMockResource.data);
    expect(csv).toContain('settlement_period_id');
    expect(csv).toContain('reconciliation_code');
    expect(csv).not.toContain('order_id,item_type');
  });
});
