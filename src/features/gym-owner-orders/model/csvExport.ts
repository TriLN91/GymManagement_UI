import type { GymOwnerOrderRecord, SettlementPeriodRecord } from './types';

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows: ReadonlyArray<ReadonlyArray<string | number>>) {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function createOrdersCsv(orders: ReadonlyArray<GymOwnerOrderRecord>) {
  return toCsv([
    [
      'order_id',
      'item_type',
      'item_name',
      'purchased_at',
      'payment_status',
      'fulfillment_status',
      'settlement_period_id',
      'currency',
      'gym_service_price',
      'discount',
      'ai_plus',
      'commission',
      'net_received',
    ],
    ...orders.map((order) => [
      order.id,
      order.itemKind,
      order.itemName,
      order.purchasedAt,
      order.paymentStatus,
      order.fulfillmentStatus,
      order.settlementPeriodId,
      order.financial.currency,
      order.financial.gymServicePriceVnd,
      order.financial.discountVnd,
      order.financial.aiPlusVnd,
      order.financial.commissionVnd,
      order.financial.netReceivedVnd,
    ]),
  ]);
}

export function createSettlementsCsv(periods: ReadonlyArray<SettlementPeriodRecord>) {
  return toCsv([
    [
      'settlement_period_id',
      'period_start',
      'period_end',
      'order_count',
      'reconciliation_code',
      'currency',
      'gym_service_price',
      'discount',
      'ai_plus',
      'commission',
      'net_received',
    ],
    ...periods.map((period) => [
      period.id,
      period.startsAt,
      period.endsAt,
      period.orderCount,
      period.reconciliation.code,
      period.financial.currency,
      period.financial.gymServicePriceVnd,
      period.financial.discountVnd,
      period.financial.aiPlusVnd,
      period.financial.commissionVnd,
      period.financial.netReceivedVnd,
    ]),
  ]);
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
