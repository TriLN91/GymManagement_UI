import { ArrowLeft, Download, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { analyticsByRange, type AnalyticsRange } from '../model/mockData';
import { usePlatformGovernanceStore } from '../model/store';
import type { DisputeStatus } from '../model/types';

import { usePlatformApprovalStore } from '@/features/platform-admin-approvals/model/store';
import { ROUTES } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage } from '@/shared/ui/workspace';

import './platform-governance.css';
const text = {
  en: {
    sample: 'Sample data',
    disputes: 'Refunds & disputes',
    detail: 'Detail',
    back: 'Back to list',
    submitted: 'Submitted',
    under_review: 'Under review',
    need_information: 'Need information',
    approved: 'Approved',
    rejected: 'Rejected',
    resolved: 'Resolved',
    evidence: 'Evidence',
    timeline: 'Case timeline',
    message: 'Message to Gym',
    send: 'Send message',
    financial: 'Backend-provided order breakdown',
    analytics: 'Platform analytics',
    range: 'Range',
    custom: 'Custom',
    gmv: 'GMV',
    gymSales: 'Gym-service sales',
    commission: 'Commission',
    plus: 'Plus revenue',
    orders: 'Successful orders',
    backend: 'Backend-provided aggregate; this screen does not calculate financial values.',
    audit: 'Audit & activity',
    export: 'Export CSV',
    action: 'Action',
    subject: 'Subject',
    time: 'Time',
    noAudit: 'No audit records yet.',
  },
  vi: {
    sample: 'Dữ liệu minh họa',
    disputes: 'Hoàn tiền & tranh chấp',
    detail: 'Chi tiết',
    back: 'Quay lại danh sách',
    submitted: 'Đã gửi',
    under_review: 'Đang rà soát',
    need_information: 'Cần bổ sung thông tin',
    approved: 'Đã chấp thuận',
    rejected: 'Đã từ chối',
    resolved: 'Đã xử lý xong',
    evidence: 'Bằng chứng',
    timeline: 'Lịch sử case',
    message: 'Trao đổi với Gym',
    send: 'Gửi tin nhắn',
    financial: 'Breakdown đơn hàng từ backend',
    analytics: 'Phân tích nền tảng',
    range: 'Khoảng thời gian',
    custom: 'Tùy chọn',
    gmv: 'GMV',
    gymSales: 'Doanh thu dịch vụ Gym',
    commission: 'Hoa hồng',
    plus: 'Doanh thu Plus',
    orders: 'Đơn thành công',
    backend: 'Aggregate do backend cung cấp; màn hình này không tính số tài chính.',
    audit: 'Nhật ký hoạt động',
    export: 'Xuất CSV',
    action: 'Hành động',
    subject: 'Đối tượng',
    time: 'Thời gian',
    noAudit: 'Chưa có audit record.',
  },
} as const;
type GovernanceCopy = (typeof text)['en'] | (typeof text)['vi'];
function useCopy() {
  const { i18n } = useTranslation();
  return {
    t: text[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'],
    locale: i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US',
  };
}
function money(n: number, l: string) {
  return new Intl.NumberFormat(l, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);
}
function label(s: DisputeStatus, t: GovernanceCopy) {
  return t[s];
}
export function PlatformDisputesPage() {
  const { t } = useCopy();
  const items = usePlatformGovernanceStore((s) => s.disputes);
  return (
    <WorkspacePage width="wide" className="platform-governance-page">
      <h1 className="sr-only">{t.disputes}</h1>
      <div className="platform-governance-toolbar">
        <Badge variant="neutral">{t.sample}</Badge>
      </div>
      <TableContainer className="platform-governance-table">
        <Table aria-label={t.disputes}>
          <TableHeader>
            <TableRow>
              <TableHead>Case</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Gym</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>{t.detail}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.id}</TableCell>
                <TableCell>{d.orderId}</TableCell>
                <TableCell>{d.gym}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      d.status === 'rejected'
                        ? 'destructive'
                        : d.status === 'resolved'
                          ? 'accent'
                          : 'neutral'
                    }
                  >
                    {label(d.status, t)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link to={ROUTES.superadmin.disputeDetailPath(d.id)}>{t.detail}</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </WorkspacePage>
  );
}
export function PlatformDisputeDetailPage() {
  const { disputeId } = useParams();
  const { t, locale } = useCopy();
  const item = usePlatformGovernanceStore((s) => s.disputes.find((d) => d.id === disputeId));
  const transition = usePlatformGovernanceStore((s) => s.transition);
  const send = usePlatformGovernanceStore((s) => s.sendMessage);
  const [message, setMessage] = useState('');
  if (!item) return null;
  const actions: Record<DisputeStatus, DisputeStatus[]> = {
    submitted: ['under_review'],
    under_review: ['need_information', 'approved', 'rejected'],
    need_information: ['under_review'],
    approved: ['resolved'],
    rejected: ['resolved'],
    resolved: [],
  };
  return (
    <WorkspacePage width="wide" className="platform-governance-page">
      <div className="platform-governance-toolbar">
        <Button asChild size="sm" variant="ghost">
          <Link to={ROUTES.superadmin.disputes}>
            <ArrowLeft size={15} />
            {t.back}
          </Link>
        </Button>
        <Badge variant="neutral">{item.id}</Badge>
      </div>
      <section className="platform-governance-card">
        <h2>{item.reason}</h2>
        <p>
          {item.orderId} · {item.gym}
        </p>
        <Badge variant="neutral">{label(item.status, t)}</Badge>
      </section>
      <section className="platform-governance-card">
        <h2>
          <FileText size={15} />
          {t.evidence}
        </h2>
        {item.evidence.map((e) => (
          <p key={e.id}>{e.name}</p>
        ))}
      </section>
      <section className="platform-governance-card">
        <h2>{t.financial}</h2>
        <dl className="platform-governance-financial">
          {[
            ['Gym service', item.financial.gymServicePriceVnd],
            ['Discount', item.financial.discountVnd],
            ['AI Plus', item.financial.aiPlusVnd],
            ['Commission', item.financial.commissionVnd],
            ['Net received', item.financial.netReceivedVnd],
          ].map(([a, b]) => (
            <div key={String(a)}>
              <dt>{a}</dt>
              <dd>{money(Number(b), locale)}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="platform-governance-card">
        <h2>{t.timeline}</h2>
        {item.timeline.map((x) => (
          <p key={x.id}>
            {x.label}
            {x.note ? ` · ${x.note}` : ''}
          </p>
        ))}
        <div className="platform-dispute-actions">
          {actions[item.status].map((a) => (
            <Button
              key={a}
              variant="outline"
              onClick={() => {
                if (transition(item.id, a)) toast.success(label(a, t));
              }}
            >
              {label(a, t)}
            </Button>
          ))}
        </div>
      </section>
      <section className="platform-governance-card">
        <h2>{t.message}</h2>
        {item.messages.map((m) => (
          <p key={m.id}>
            <strong>{m.author}:</strong> {m.body}
          </p>
        ))}
        <div className="platform-message-form">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button
            onClick={() => {
              if (send(item.id, message)) {
                setMessage('');
                toast.success(t.send);
              }
            }}
          >
            <Send size={15} />
            {t.send}
          </Button>
        </div>
      </section>
    </WorkspacePage>
  );
}
export function PlatformAnalyticsPage() {
  const { t, locale } = useCopy();
  const [range, setRange] = useState<keyof typeof analyticsByRange>('30');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const data = analyticsByRange[range];
  const metric = [
    [t.gmv, data.gmvVnd],
    [t.gymSales, data.gymServiceSalesVnd],
    [t.commission, data.commissionVnd],
    [t.plus, data.plusRevenueVnd],
    [t.orders, data.successfulOrders],
  ];
  return (
    <WorkspacePage width="wide" className="platform-governance-page">
      <h1 className="sr-only">{t.analytics}</h1>
      <div className="platform-governance-toolbar">
        <Badge variant="neutral">{t.sample}</Badge>
        <div className="platform-range">
          <span>{t.range}</span>
          {(['7', '30', '90', 'custom'] as const satisfies readonly AnalyticsRange[]).map((x) => (
            <Button
              key={x}
              variant={range === x ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRange(x)}
            >
              {x === 'custom' ? t.custom : `${x}d`}
            </Button>
          ))}
        </div>
      </div>
      {range === 'custom' ? (
        <div className="platform-custom-range">
          <Input
            type="date"
            value={custom.from}
            onChange={(e) => setCustom({ ...custom, from: e.target.value })}
          />
          <Input
            type="date"
            value={custom.to}
            onChange={(e) => setCustom({ ...custom, to: e.target.value })}
          />
        </div>
      ) : null}
      <p className="platform-governance-notice">{t.backend}</p>
      <section className="platform-analytics-grid">
        {metric.map(([name, value]) => (
          <article key={String(name)}>
            <span>{name}</span>
            <strong>
              {typeof value === 'number' && String(name) === t.orders
                ? value
                : money(Number(value), locale)}
            </strong>
            <small>
              {data.comparisonPercent}% · {data.comparisonLabel}
            </small>
          </article>
        ))}
      </section>
    </WorkspacePage>
  );
}
export function PlatformAuditPage() {
  const { t, locale } = useCopy();
  const audit = usePlatformApprovalStore((s) => s.audit);
  const csv = () => {
    const body = [
      'Time,Action,Subject',
      ...audit.map((a) => `${a.at},${a.action},${a.subjectId}`),
    ].join('\n');
    const u = URL.createObjectURL(new Blob([body], { type: 'text/csv' }));
    const l = document.createElement('a');
    l.href = u;
    l.download = 'platform-audit.csv';
    l.click();
    URL.revokeObjectURL(u);
  };
  return (
    <WorkspacePage width="wide" className="platform-governance-page">
      <div className="platform-governance-toolbar">
        <Badge variant="neutral">{t.audit}</Badge>
        <Button size="sm" variant="outline" onClick={csv}>
          <Download size={15} />
          {t.export}
        </Button>
      </div>
      {audit.length === 0 ? (
        <p>{t.noAudit}</p>
      ) : (
        <TableContainer className="platform-governance-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.time}</TableHead>
                <TableHead>{t.action}</TableHead>
                <TableHead>{t.subject}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Intl.DateTimeFormat(locale).format(new Date(a.at))}</TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell>{a.subjectId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </WorkspacePage>
  );
}
