import { Download, LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { createSettlementsCsv, downloadCsv } from '../model/csvExport';
import { gymOwnerSettlementMockResource } from '../model/mockData';

import { CommerceState } from './CommerceState';
import { gymOwnerOrdersCopy } from './copy';
import { formatPeriod, formatVnd } from './formatters';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { WorkspacePage } from '@/shared/ui/workspace';

import './gym-owner-orders.css';

export function GymOwnerSettlementsPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const copy = gymOwnerOrdersCopy[isVi ? 'vi' : 'en'];
  const locale = isVi ? 'vi-VN' : 'en-US';

  const exportSettlements = () => {
    if (gymOwnerSettlementMockResource.state !== 'loaded') return;
    downloadCsv(
      'gym-settlements.csv',
      createSettlementsCsv(gymOwnerSettlementMockResource.data),
    );
  };

  return (
    <WorkspacePage width="wide" className="gym-commerce-page">
      <h1 className="sr-only">{copy.settlementsLabel}</h1>
      <div className="gym-commerce-toolbar">
        <Badge variant="neutral">
          <LockKeyhole aria-hidden="true" size={13} />
          {copy.readOnlySettlement}
        </Badge>
        <Button variant="outline" size="sm" onClick={exportSettlements}>
          <Download aria-hidden="true" size={15} />
          {copy.exportSettlements}
        </Button>
      </div>

      <p className="gym-commerce-notice">{copy.backendNotice}</p>

      <CommerceState
        resource={gymOwnerSettlementMockResource}
        loadingLabel={copy.loadingSettlements}
        emptyLabel={copy.emptySettlements}
        errorLabel={copy.errorSettlements}
      >
        {(periods) => (
          <TableContainer className="gym-settlement-table-shell">
            <Table aria-label={copy.settlementsLabel} className="gym-settlement-table">
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.period}</TableHead>
                  <TableHead>{copy.orders}</TableHead>
                  <TableHead className="is-money">{copy.gymServicePrice}</TableHead>
                  <TableHead className="is-money">{copy.discount}</TableHead>
                  <TableHead className="is-money">{copy.aiPlus}</TableHead>
                  <TableHead className="is-money">{copy.commission}</TableHead>
                  <TableHead className="is-money">{copy.netReceived}</TableHead>
                  <TableHead>{copy.reconciliation}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell data-label={copy.period}>
                      <div className="gym-order-identity">
                        <strong>{period.id}</strong>
                        <span>{formatPeriod(period.startsAt, period.endsAt, locale)}</span>
                      </div>
                    </TableCell>
                    <TableCell data-label={copy.orders}>{period.orderCount}</TableCell>
                    <TableCell data-label={copy.gymServicePrice} className="is-money">
                      {formatVnd(period.financial.gymServicePriceVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.discount} className="is-money is-discount">
                      {formatVnd(period.financial.discountVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.aiPlus} className="is-money is-plus">
                      {formatVnd(period.financial.aiPlusVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.commission} className="is-money is-commission">
                      {formatVnd(period.financial.commissionVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.netReceived} className="is-money is-net">
                      {formatVnd(period.financial.netReceivedVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.reconciliation}>
                      <Badge variant="accent">
                        {isVi ? period.reconciliation.label.vi : period.reconciliation.label.en}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CommerceState>
    </WorkspacePage>
  );
}
