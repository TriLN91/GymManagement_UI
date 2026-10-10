import { ArrowLeft, Download, Save, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { exportPlatformOrders, exportPlatformSettlements } from '../model/csv';
import { usePlatformCommercialStore } from '../model/store';
import type { PlatformFinancialBreakdown } from '../model/types';

import { commercialCopy } from './copy';

import { ROUTES } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { EmptyState } from '@/shared/ui/empty';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
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

import './platform-commercial.css';
function useCopy() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  return { copy: commercialCopy[isVi ? 'vi' : 'en'], locale: isVi ? 'vi-VN' : 'en-US' };
}
function money(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}
function date(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
function Breakdown({
  financial,
  copy,
  locale,
}: {
  financial: PlatformFinancialBreakdown;
  copy: ReturnType<typeof useCopy>['copy'];
  locale: string;
}) {
  return (
    <dl className="platform-financial-breakdown">
      {[
        [copy.gymService, financial.gymServicePriceVnd, ''],
        [copy.discount, financial.discountVnd, 'is-discount'],
        [copy.aiPlus, financial.aiPlusVnd, 'is-plus'],
        [copy.commissionValue, financial.commissionVnd, 'is-commission'],
        [copy.netReceived, financial.netReceivedVnd, 'is-net'],
      ].map(([label, value, className]) => (
        <div className={String(className)} key={String(label)}>
          <dt>{label}</dt>
          <dd>{money(Number(value), locale)}</dd>
        </div>
      ))}
    </dl>
  );
}
export function PlatformCommercialConfigPage() {
  const { copy, locale } = useCopy();
  const versions = usePlatformCommercialStore((s) => s.commissionVersions);
  const plus = usePlatformCommercialStore((s) => s.plusPricing);
  const add = usePlatformCommercialStore((s) => s.addCommissionVersion);
  const update = usePlatformCommercialStore((s) => s.updatePlusPricing);
  const [rate, setRate] = useState('');
  const [effective, setEffective] = useState('');
  const [prices, setPrices] = useState({
    standaloneVnd: String(plus.standaloneVnd),
    bundledVnd: String(plus.bundledVnd),
    partnerVnd: String(plus.partnerVnd),
  });
  const [pending, setPending] = useState<'commission' | 'plus' | null>(null);
  const [error, setError] = useState('');
  const submit = (kind: 'commission' | 'plus') => {
    if (kind === 'commission') {
      const effectiveDate = new Date(effective);
      if (
        !Number.isFinite(Number(rate)) ||
        Number(rate) < 0 ||
        !effective ||
        Number.isNaN(effectiveDate.getTime()) ||
        effectiveDate <= new Date()
      ) {
        setError(copy.invalidCommission);
        return;
      }
    } else {
      const values = {
        standaloneVnd: Number(prices.standaloneVnd),
        bundledVnd: Number(prices.bundledVnd),
        partnerVnd: Number(prices.partnerVnd),
      };
      if (
        Object.values(values).some((value) => !Number.isFinite(value) || value < 0) ||
        values.bundledVnd > values.standaloneVnd ||
        values.partnerVnd > values.standaloneVnd
      ) {
        setError(copy.invalidPlus);
        return;
      }
    }
    setError('');
    setPending(kind);
  };
  const confirm = () => {
    if (pending === 'commission') add(Number(rate), effective);
    if (pending === 'plus') {
      update({
        standaloneVnd: Number(prices.standaloneVnd),
        bundledVnd: Number(prices.bundledVnd),
        partnerVnd: Number(prices.partnerVnd),
      });
    }
    setPending(null);
    toast.success(copy.save);
  };
  return (
    <WorkspacePage width="wide" className="platform-commercial-page">
      <h1 className="sr-only">{copy.configuration}</h1>
      <div className="platform-commercial-toolbar">
        <Badge variant="neutral">{copy.sample}</Badge>
      </div>
      <section className="platform-commercial-card">
        <div className="platform-commercial-heading">
          <h2>{copy.commission}</h2>
          <p>{copy.confirmationDescription}</p>
        </div>
        <div className="platform-commercial-form">
          <div>
            <Label htmlFor="commission-rate">{copy.rate}</Label>
            <Input
              id="commission-rate"
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => {
                setRate(e.target.value);
                setError('');
              }}
            />
          </div>
          <div>
            <Label htmlFor="commission-effective">{copy.effectiveAt}</Label>
            <Input
              id="commission-effective"
              type="datetime-local"
              value={effective}
              onChange={(e) => {
                setEffective(e.target.value);
                setError('');
              }}
            />
          </div>
          <Button onClick={() => submit('commission')}>
            <Save aria-hidden="true" size={15} />
            {copy.save}
          </Button>
        </div>
        <h3>{copy.history}</h3>
        <ol className="platform-commission-history">
          {versions.map((v) => (
            <li key={v.id}>
              <strong>{v.ratePercent}%</strong>
              <span>
                {copy.effectiveAt} · {date(v.effectiveAt, locale)}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section className="platform-commercial-card">
        <div className="platform-commercial-heading">
          <h2>{copy.plus}</h2>
          <p>{copy.priceRule}</p>
        </div>
        <div className="platform-commercial-form is-pricing">
          {(['standaloneVnd', 'bundledVnd', 'partnerVnd'] as const).map((key) => (
            <div key={key}>
              <Label htmlFor={key}>
                {key === 'standaloneVnd'
                  ? copy.standalone
                  : key === 'bundledVnd'
                    ? copy.bundled
                    : copy.partner}
              </Label>
              <Input
                id={key}
                type="number"
                min="0"
                value={prices[key]}
                onChange={(e) => {
                  setPrices({ ...prices, [key]: e.target.value });
                  setError('');
                }}
              />
            </div>
          ))}
          <Button onClick={() => submit('plus')}>
            <Save aria-hidden="true" size={15} />
            {copy.save}
          </Button>
        </div>
        {error ? (
          <p className="platform-commercial-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.confirmation}</DialogTitle>
            <DialogDescription>{copy.confirmationDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              {copy.cancel}
            </Button>
            <Button onClick={confirm}>{copy.confirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
export function PlatformOrdersPage() {
  const { copy, locale } = useCopy();
  const orders = usePlatformCommercialStore((s) => s.orders);
  return (
    <WorkspacePage width="wide" className="platform-commercial-page">
      <h1 className="sr-only">{copy.orders}</h1>
      <div className="platform-commercial-toolbar">
        <Badge variant="neutral">
          <ShieldCheck aria-hidden="true" size={13} />
          {copy.sample}
        </Badge>
        <Button size="sm" variant="outline" onClick={() => exportPlatformOrders(orders)}>
          <Download aria-hidden="true" size={15} />
          {copy.export}
        </Button>
      </div>
      <p className="platform-commercial-notice">{copy.backend}</p>
      {orders.length === 0 ? (
        <EmptyState title={copy.noOrders} />
      ) : (
        <TableContainer className="platform-commercial-table-shell">
          <Table className="platform-commercial-table" aria-label={copy.orders}>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.purchaser}</TableHead>
                <TableHead>{copy.item}</TableHead>
                <TableHead className="is-money">{copy.gymService}</TableHead>
                <TableHead className="is-money">{copy.discount}</TableHead>
                <TableHead className="is-money">{copy.aiPlus}</TableHead>
                <TableHead className="is-money">{copy.commissionValue}</TableHead>
                <TableHead className="is-money">{copy.netReceived}</TableHead>
                <TableHead>{copy.detail}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell data-label={copy.purchaser}>
                    <strong>{o.id}</strong>
                    <span>{o.purchaserDisplayName}</span>
                  </TableCell>
                  <TableCell data-label={copy.item}>{o.itemName}</TableCell>
                  <TableCell className="is-money" data-label={copy.gymService}>
                    {money(o.financial.gymServicePriceVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money is-discount" data-label={copy.discount}>
                    {money(o.financial.discountVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money is-plus" data-label={copy.aiPlus}>
                    {money(o.financial.aiPlusVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money" data-label={copy.commissionValue}>
                    {money(o.financial.commissionVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money is-net" data-label={copy.netReceived}>
                    {money(o.financial.netReceivedVnd, locale)}
                  </TableCell>
                  <TableCell data-label={copy.detail}>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.superadmin.orderDetailPath(o.id)}>{copy.detail}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </WorkspacePage>
  );
}
export function PlatformOrderDetailPage() {
  const { orderId } = useParams();
  const { copy, locale } = useCopy();
  const order = usePlatformCommercialStore((s) => s.orders.find((o) => o.id === orderId));
  if (!order)
    return (
      <WorkspacePage width="wide">
        <EmptyState title={copy.noOrders} />
      </WorkspacePage>
    );
  return (
    <WorkspacePage width="wide" className="platform-commercial-page">
      <h1 className="sr-only">{order.id}</h1>
      <div className="platform-commercial-toolbar">
        <Button asChild size="sm" variant="ghost">
          <Link to={ROUTES.superadmin.orders}>
            <ArrowLeft aria-hidden="true" size={15} />
            {copy.back}
          </Link>
        </Button>
        <Badge variant="neutral">{copy.backend}</Badge>
      </div>
      <section className="platform-commercial-card">
        <div className="platform-commercial-heading">
          <h2>{order.id}</h2>
          <p>
            {order.itemName} · {order.purchaserDisplayName}
          </p>
        </div>
        <Breakdown financial={order.financial} copy={copy} locale={locale} />
      </section>
    </WorkspacePage>
  );
}
export function PlatformSettlementsPage() {
  const { copy, locale } = useCopy();
  const settlements = usePlatformCommercialStore((s) => s.settlements);
  return (
    <WorkspacePage width="wide" className="platform-commercial-page">
      <h1 className="sr-only">{copy.settlements}</h1>
      <div className="platform-commercial-toolbar">
        <Badge variant="neutral">{copy.sample}</Badge>
        <Button size="sm" variant="outline" onClick={() => exportPlatformSettlements(settlements)}>
          <Download aria-hidden="true" size={15} />
          {copy.export}
        </Button>
      </div>
      <p className="platform-commercial-notice">{copy.backend}</p>
      {settlements.length === 0 ? (
        <EmptyState title={copy.noSettlements} />
      ) : (
        <TableContainer className="platform-commercial-table-shell">
          <Table className="platform-commercial-table" aria-label={copy.settlements}>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.period}</TableHead>
                <TableHead>{copy.orderCount}</TableHead>
                <TableHead className="is-money">{copy.gymService}</TableHead>
                <TableHead className="is-money">{copy.discount}</TableHead>
                <TableHead className="is-money">{copy.aiPlus}</TableHead>
                <TableHead className="is-money">{copy.commissionValue}</TableHead>
                <TableHead className="is-money">{copy.netReceived}</TableHead>
                <TableHead>{copy.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((s) => (
                <TableRow key={s.id}>
                  <TableCell data-label={copy.period}>
                    <strong>{s.id}</strong>
                    <span>
                      {date(s.startsAt, locale)} — {date(s.endsAt, locale)}
                    </span>
                  </TableCell>
                  <TableCell data-label={copy.orderCount}>{s.orderCount}</TableCell>
                  <TableCell className="is-money" data-label={copy.gymService}>
                    {money(s.financial.gymServicePriceVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money is-discount" data-label={copy.discount}>
                    {money(s.financial.discountVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money is-plus" data-label={copy.aiPlus}>
                    {money(s.financial.aiPlusVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money" data-label={copy.commissionValue}>
                    {money(s.financial.commissionVnd, locale)}
                  </TableCell>
                  <TableCell className="is-money is-net" data-label={copy.netReceived}>
                    {money(s.financial.netReceivedVnd, locale)}
                  </TableCell>
                  <TableCell data-label={copy.status}>
                    <Badge variant={s.reconciliationStatus === 'reconciled' ? 'accent' : 'neutral'}>
                      {s.reconciliationStatus === 'reconciled' ? copy.reconciled : copy.inReview}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </WorkspacePage>
  );
}
