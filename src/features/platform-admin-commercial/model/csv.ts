import type { PlatformOrder, PlatformSettlement } from './types';

function escapeCsv(value: string | number) {
  const string = String(value);
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}
function documentDownload(filename: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
export function exportPlatformOrders(orders: ReadonlyArray<PlatformOrder>) {
  const rows = [
    [
      'Order',
      'Item',
      'Gym service price',
      'Discount',
      'AI Plus',
      'Commission',
      'Net received',
      'Settlement',
    ],
    ...orders.map((order) => [
      order.id,
      order.itemName,
      order.financial.gymServicePriceVnd,
      order.financial.discountVnd,
      order.financial.aiPlusVnd,
      order.financial.commissionVnd,
      order.financial.netReceivedVnd,
      order.settlementId,
    ]),
  ];
  documentDownload(
    'platform-orders.csv',
    rows.map((row) => row.map(escapeCsv).join(',')).join('\n'),
  );
}
export function exportPlatformSettlements(items: ReadonlyArray<PlatformSettlement>) {
  const rows = [
    [
      'Settlement',
      'Order count',
      'Gym service price',
      'Discount',
      'AI Plus',
      'Commission',
      'Net received',
      'Status',
    ],
    ...items.map((item) => [
      item.id,
      item.orderCount,
      item.financial.gymServicePriceVnd,
      item.financial.discountVnd,
      item.financial.aiPlusVnd,
      item.financial.commissionVnd,
      item.financial.netReceivedVnd,
      item.reconciliationStatus,
    ]),
  ];
  documentDownload(
    'platform-settlements.csv',
    rows.map((row) => row.map(escapeCsv).join(',')).join('\n'),
  );
}
