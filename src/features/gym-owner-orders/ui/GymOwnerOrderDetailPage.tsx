import { ArrowLeft, Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { gymOwnerOrderMockResource } from '../model/mockData';
import type {
  RefundDisputeRequestDraft,
  SubmittedRefundDisputeRequest,
} from '../model/types';

import { gymOwnerOrdersCopy } from './copy';
import { FinancialBreakdown } from './FinancialBreakdown';
import { formatDateTime } from './formatters';
import { RefundDisputeDialog } from './RefundDisputeDialog';

import { ROUTES } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty';
import { WorkspacePage } from '@/shared/ui/workspace';

import './gym-owner-orders.css';

export function GymOwnerOrderDetailPage() {
  const { orderId } = useParams();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const copy = gymOwnerOrdersCopy[isVi ? 'vi' : 'en'];
  const locale = isVi ? 'vi-VN' : 'en-US';
  const [requestOpen, setRequestOpen] = useState(false);
  const [submittedRequest, setSubmittedRequest] =
    useState<SubmittedRefundDisputeRequest | null>(null);

  const order =
    gymOwnerOrderMockResource.state === 'loaded'
      ? gymOwnerOrderMockResource.data.find((record) => record.id === orderId)
      : undefined;

  if (!order) {
    return (
      <WorkspacePage width="wide" className="gym-commerce-page">
        <EmptyState
          title={copy.orderNotFound}
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.admin.orders}>{copy.backToOrders}</Link>
            </Button>
          }
        />
      </WorkspacePage>
    );
  }

  const submitRequest = (draft: RefundDisputeRequestDraft) => {
    setSubmittedRequest({
      ...draft,
      id: `request-${Date.now()}`,
      orderId: order.id,
      submittedAt: new Date().toISOString(),
    });
    setRequestOpen(false);
    toast.success(copy.requestSubmitted);
  };

  return (
    <WorkspacePage width="wide" className="gym-commerce-page">
      <h1 className="sr-only">
        {copy.order} {order.id}
      </h1>
      <div className="gym-commerce-toolbar">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.admin.orders}>
            <ArrowLeft aria-hidden="true" size={15} />
            {copy.backToOrders}
          </Link>
        </Button>
        <Badge variant="neutral">
          <ShieldCheck aria-hidden="true" size={13} />
          {copy.platformValues}
        </Badge>
      </div>

      <section className="gym-order-detail-card" aria-labelledby="order-information-title">
        <div className="gym-detail-section-heading">
          <div>
            <span>{copy.orderInformation}</span>
            <h2 id="order-information-title">{order.id}</h2>
          </div>
          <Badge variant="accent">
            {order.paymentStatus === 'succeeded' ? copy.paid : copy.paymentFailed}
          </Badge>
        </div>
        <dl className="gym-order-metadata">
          <div>
            <dt>{copy.item}</dt>
            <dd>{order.itemName}</dd>
          </div>
          <div>
            <dt>{copy.purchaser}</dt>
            <dd>{order.purchaserDisplayName}</dd>
          </div>
          <div>
            <dt>{copy.purchasedAt}</dt>
            <dd>{formatDateTime(order.purchasedAt, locale)}</dd>
          </div>
          <div>
            <dt>{copy.paymentMethod}</dt>
            <dd>{order.paymentMethod === 'card' ? copy.card : copy.bankTransfer}</dd>
          </div>
          <div>
            <dt>{copy.settlementPeriod}</dt>
            <dd>{order.settlementPeriodId}</dd>
          </div>
        </dl>
      </section>

      <section className="gym-order-detail-card" aria-labelledby="financial-breakdown-title">
        <div className="gym-detail-section-heading">
          <div>
            <span>{copy.platformValues}</span>
            <h2 id="financial-breakdown-title">{copy.financialBreakdown}</h2>
          </div>
        </div>
        <FinancialBreakdown financial={order.financial} copy={copy} locale={locale} />
        <p className="gym-commerce-notice">{copy.backendNotice}</p>
      </section>

      <section className="gym-order-request-panel" aria-labelledby="request-panel-title">
        <div>
          <span>{copy.requestDescription}</span>
          <h2 id="request-panel-title">{copy.requestRefundDispute}</h2>
        </div>
        {submittedRequest ? (
          <div className="gym-submitted-request" role="status">
            <Badge variant="accent">{copy.platformReview}</Badge>
            <strong>
              {submittedRequest.kind === 'refund' ? copy.refund : copy.dispute} ·{' '}
              {copy.submittedRequest}
            </strong>
            <span>{formatDateTime(submittedRequest.submittedAt, locale)}</span>
          </div>
        ) : (
          <Button onClick={() => setRequestOpen(true)}>
            <Send aria-hidden="true" size={15} />
            {copy.requestRefundDispute}
          </Button>
        )}
      </section>

      <RefundDisputeDialog
        open={requestOpen}
        copy={copy}
        onOpenChange={setRequestOpen}
        onSubmit={submitRequest}
      />
    </WorkspacePage>
  );
}
