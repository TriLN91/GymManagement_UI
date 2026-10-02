import type { BackendFinancialBreakdown } from '../model/types';

import type { GymOwnerOrdersCopy } from './copy';
import { formatVnd } from './formatters';

interface FinancialBreakdownProps {
  financial: BackendFinancialBreakdown;
  copy: GymOwnerOrdersCopy;
  locale: string;
  compact?: boolean;
}

export function FinancialBreakdown({
  financial,
  copy,
  locale,
  compact = false,
}: FinancialBreakdownProps) {
  const rows = [
    { label: copy.gymServicePrice, value: financial.gymServicePriceVnd, className: '' },
    { label: copy.discount, value: financial.discountVnd, className: 'is-discount' },
    { label: copy.aiPlus, value: financial.aiPlusVnd, className: 'is-plus' },
    { label: copy.commission, value: financial.commissionVnd, className: 'is-commission' },
    { label: copy.netReceived, value: financial.netReceivedVnd, className: 'is-net' },
  ];

  return (
    <dl className={compact ? 'gym-financial-grid is-compact' : 'gym-financial-grid'}>
      {rows.map((row) => (
        <div className={row.className} key={row.label}>
          <dt>{row.label}</dt>
          <dd>{formatVnd(row.value, locale)}</dd>
        </div>
      ))}
    </dl>
  );
}
