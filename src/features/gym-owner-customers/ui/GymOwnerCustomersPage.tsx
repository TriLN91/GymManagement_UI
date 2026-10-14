import { LockKeyhole } from 'lucide-react';

import { gymOwnerPurchaserMockResource } from '../model/mockData';
import type { OperationalPurchaserRecord } from '../model/types';

import { gymOwnerCustomersCopy, type GymOwnerCustomersCopy } from './copy';
import { PurchaserListState } from './PurchaserListState';

import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
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

import './gym-owner-customers.css';

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function processingLabel(record: OperationalPurchaserRecord, copy: GymOwnerCustomersCopy) {
  return record.processingStatus === 'pending_gym_confirmation'
    ? copy.pendingGymConfirmation
    : copy.trainerAssignmentActive;
}

export function GymOwnerCustomersPage() {
  const { language, locale } = useLocale();
  const copy = gymOwnerCustomersCopy[language];

  return (
    <WorkspacePage width="wide" className="gym-customers-page">
      <h1 className="sr-only">{copy.pageLabel}</h1>
      <div className="gym-customers-toolbar">
        <Badge variant="neutral">
          <LockKeyhole aria-hidden="true" size={13} />
          {copy.readOnly}
        </Badge>
      </div>

      <PurchaserListState
        resource={gymOwnerPurchaserMockResource}
        loadingLabel={copy.loading}
        emptyLabel={copy.empty}
        errorLabel={copy.error}
      >
        {(records) => (
          <TableContainer className="gym-customers-table-shell">
            <Table aria-label={copy.pageLabel} className="gym-customers-table">
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.purchaser}</TableHead>
                  <TableHead>{copy.purchase}</TableHead>
                  <TableHead>{copy.order}</TableHead>
                  <TableHead>{copy.processingStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.orderId}>
                    <TableCell data-label={copy.purchaser}>
                      <div className="gym-customer-identity">
                        <span aria-hidden="true">
                          {record.purchaserName
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                        <div>
                          <strong>{record.purchaserName}</strong>
                          <span>{record.purchaserEmail}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-label={copy.purchase}>
                      <div className="gym-customer-purchase">
                        <Badge variant="neutral">
                          {record.purchaseKind === 'gym_offer' ? copy.gymOffer : copy.ptPackage}
                        </Badge>
                        <strong>{record.productName}</strong>
                      </div>
                    </TableCell>
                    <TableCell data-label={copy.order}>
                      <div className="gym-customer-order">
                        <strong>{record.orderId}</strong>
                        <dl>
                          <div>
                            <dt>{copy.purchasedAt}</dt>
                            <dd>{formatDateTime(record.purchasedAt, locale)}</dd>
                          </div>
                          <div>
                            <dt>{copy.payment}</dt>
                            <dd>
                              {record.paymentMethod === 'card' ? copy.card : copy.bankTransfer} ·{' '}
                              {copy.paymentSucceeded}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </TableCell>
                    <TableCell data-label={copy.processingStatus}>
                      <Badge
                        variant={
                          record.processingStatus === 'trainer_assignment_active'
                            ? 'accent'
                            : 'neutral'
                        }
                      >
                        {processingLabel(record, copy)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </PurchaserListState>
    </WorkspacePage>
  );
}
