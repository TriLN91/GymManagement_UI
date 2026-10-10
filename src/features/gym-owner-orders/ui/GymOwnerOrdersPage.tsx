import { Download, Eye, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { createOrdersCsv, downloadCsv } from '../model/csvExport';
import { gymOwnerOrderMockResource } from '../model/mockData';
import type { GymOwnerOrderRecord } from '../model/types';

import { CommerceState } from './CommerceState';
import { gymOwnerOrdersCopy, type GymOwnerOrdersCopy } from './copy';
import { formatDateTime, formatVnd } from './formatters';

import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
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

function fulfillmentLabel(order: GymOwnerOrderRecord, copy: GymOwnerOrdersCopy) {
  return order.fulfillmentStatus === 'pending_gym_confirmation'
    ? copy.pendingGymConfirmation
    : copy.trainerAssignmentActive;
}

export function GymOwnerOrdersPage() {
  const { language, locale } = useLocale();
  const copy = gymOwnerOrdersCopy[language];

  const exportOrders = () => {
    if (gymOwnerOrderMockResource.state !== 'loaded') return;
    downloadCsv('gym-orders.csv', createOrdersCsv(gymOwnerOrderMockResource.data));
  };

  return (
    <WorkspacePage width="wide" className="gym-commerce-page">
      <h1 className="sr-only">{copy.ordersLabel}</h1>
      <div className="gym-commerce-toolbar">
        <Badge variant="neutral">
          <ShieldCheck aria-hidden="true" size={13} />
          {copy.platformValues}
        </Badge>
        <Button variant="outline" size="sm" onClick={exportOrders}>
          <Download aria-hidden="true" size={15} />
          {copy.exportOrders}
        </Button>
      </div>

      <p className="gym-commerce-notice">{copy.backendNotice}</p>

      <CommerceState
        resource={gymOwnerOrderMockResource}
        loadingLabel={copy.loadingOrders}
        emptyLabel={copy.emptyOrders}
        errorLabel={copy.errorOrders}
      >
        {(orders) => (
          <TableContainer className="gym-orders-table-shell">
            <Table aria-label={copy.ordersLabel} className="gym-orders-table">
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.order}</TableHead>
                  <TableHead>{copy.item}</TableHead>
                  <TableHead className="is-money">{copy.gymServicePrice}</TableHead>
                  <TableHead className="is-money">{copy.discount}</TableHead>
                  <TableHead className="is-money">{copy.aiPlus}</TableHead>
                  <TableHead className="is-money">{copy.commission}</TableHead>
                  <TableHead className="is-money">{copy.netReceived}</TableHead>
                  <TableHead>{copy.status}</TableHead>
                  <TableHead>{copy.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell data-label={copy.order}>
                      <div className="gym-order-identity">
                        <strong>{order.id}</strong>
                        <span>{order.purchaserDisplayName}</span>
                        <span>{formatDateTime(order.purchasedAt, locale)}</span>
                      </div>
                    </TableCell>
                    <TableCell data-label={copy.item}>
                      <div className="gym-order-item">
                        <Badge variant="neutral">
                          {order.itemKind === 'gym_offer' ? copy.gymOffer : copy.ptPackage}
                        </Badge>
                        <strong>{order.itemName}</strong>
                      </div>
                    </TableCell>
                    <TableCell data-label={copy.gymServicePrice} className="is-money">
                      {formatVnd(order.financial.gymServicePriceVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.discount} className="is-money is-discount">
                      {formatVnd(order.financial.discountVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.aiPlus} className="is-money is-plus">
                      {formatVnd(order.financial.aiPlusVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.commission} className="is-money is-commission">
                      {formatVnd(order.financial.commissionVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.netReceived} className="is-money is-net">
                      {formatVnd(order.financial.netReceivedVnd, locale)}
                    </TableCell>
                    <TableCell data-label={copy.status}>
                      <div className="gym-order-statuses">
                        <Badge variant="accent">
                          {order.paymentStatus === 'succeeded' ? copy.paid : copy.paymentFailed}
                        </Badge>
                        <span>{fulfillmentLabel(order, copy)}</span>
                      </div>
                    </TableCell>
                    <TableCell data-label={copy.actions}>
                      <Button asChild variant="outline" size="sm">
                        <Link to={ROUTES.admin.orderDetailPath(order.id)}>
                          <Eye aria-hidden="true" size={14} />
                          {copy.viewDetail}
                        </Link>
                      </Button>
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
