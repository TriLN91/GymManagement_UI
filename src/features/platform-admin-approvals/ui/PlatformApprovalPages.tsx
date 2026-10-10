import { ArrowLeft, FileText, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { usePlatformApprovalStore } from '../model/store';
import type { PlatformApprovalKind, RejectionReason } from '../model/types';

import {
  approvalKindLabel,
  approvalStatusLabel,
  platformApprovalsCopy,
  rejectionReasonLabels,
} from './copy';

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
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage } from '@/shared/ui/workspace';

import './platform-approvals.css';

interface ApprovalQueuePageProps {
  kind: PlatformApprovalKind;
}

function useCopy() {
  const { i18n } = useTranslation();
  const language: 'en' | 'vi' = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  return {
    copy: platformApprovalsCopy[language],
    language,
    locale: language === 'vi' ? 'vi-VN' : 'en-US',
  };
}

function queueRoute(kind: PlatformApprovalKind) {
  return kind === 'gym_application'
    ? ROUTES.superadmin.gymApplications
    : kind === 'legal_change'
      ? ROUTES.superadmin.legalChanges
      : ROUTES.superadmin.trainerApplications;
}

function detailRoute(kind: PlatformApprovalKind, id: string) {
  return kind === 'gym_application'
    ? ROUTES.superadmin.gymApplicationDetailPath(id)
    : kind === 'legal_change'
      ? ROUTES.superadmin.legalChangeDetailPath(id)
      : ROUTES.superadmin.trainerApplicationDetailPath(id);
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusVariant(status: 'pending' | 'approved' | 'rejected') {
  return status === 'approved' ? 'accent' : status === 'rejected' ? 'destructive' : 'neutral';
}

export function PlatformApprovalQueuePage({ kind }: ApprovalQueuePageProps) {
  const approvals = usePlatformApprovalStore((state) => state.approvals);
  const { copy, locale } = useCopy();
  const records = approvals.filter((record) => record.kind === kind && record.status === 'pending');

  return (
    <WorkspacePage width="wide" className="platform-approvals-page">
      <h1 className="sr-only">{approvalKindLabel(kind, copy)}</h1>
      <div className="platform-approvals-toolbar">
        <Badge variant="neutral">{copy.sample}</Badge>
        <span>
          {records.length} {copy.pending.toLowerCase()}
        </span>
      </div>
      {records.length === 0 ? (
        <EmptyState className="platform-approvals-empty" title={copy.noRecords} />
      ) : (
        <div className="platform-approval-card-grid">
          {records.map((record) => (
            <article className="platform-approval-card" key={record.id}>
              <div className="platform-approval-card__topline">
                <span>{record.reference}</span>
                <Badge variant={statusVariant(record.status)}>
                  {approvalStatusLabel(record.status, copy)}
                </Badge>
              </div>
              <div className="platform-approval-card__identity">
                <span aria-hidden="true">{record.applicantName.slice(0, 1)}</span>
                <div>
                  <strong>{record.organizationName ?? record.applicantName}</strong>
                  <small>{record.applicantName}</small>
                </div>
              </div>
              <div className="platform-approval-card__footer">
                <time dateTime={record.submittedAt}>
                  {copy.submitted} · {formatDate(record.submittedAt, locale)}
                </time>
                <Button asChild variant="outline" size="sm">
                  <Link to={detailRoute(kind, record.id)}>{copy.detail}</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </WorkspacePage>
  );
}

export function PlatformApprovalDetailPage({ kind }: ApprovalQueuePageProps) {
  const { applicationId } = useParams();
  const record = usePlatformApprovalStore((state) =>
    state.approvals.find((approval) => approval.id === applicationId && approval.kind === kind),
  );
  const approve = usePlatformApprovalStore((state) => state.approve);
  const reject = usePlatformApprovalStore((state) => state.reject);
  const { copy, language, locale } = useCopy();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState<RejectionReason | ''>('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const queue = queueRoute(kind);

  if (!record) {
    return (
      <WorkspacePage width="wide" className="platform-approvals-page">
        <EmptyState
          title={copy.notFound}
          action={
            <Button asChild variant="outline">
              <Link to={queue}>{copy.back}</Link>
            </Button>
          }
        />
      </WorkspacePage>
    );
  }

  const handleApprove = () => {
    approve(record.id);
    setApproveOpen(false);
    toast.success(`${record.reference} · ${copy.approved}`);
  };
  const handleReject = () => {
    if (!reason || !note.trim()) {
      setFormError(copy.reasonRequired);
      return;
    }
    reject(record.id, reason, note.trim());
    setRejectOpen(false);
    toast.success(`${record.reference} · ${copy.rejected}`);
  };

  return (
    <WorkspacePage width="wide" className="platform-approvals-page platform-approval-detail">
      <h1 className="sr-only">{record.reference}</h1>
      <div className="platform-approvals-toolbar">
        <Button asChild variant="ghost" size="sm">
          <Link to={queue}>
            <ArrowLeft aria-hidden="true" size={15} />
            {copy.back}
          </Link>
        </Button>
        <Badge variant="neutral">
          <ShieldCheck aria-hidden="true" size={13} />
          {copy.sample}
        </Badge>
      </div>
      <section className="platform-detail-card" aria-labelledby="submission-heading">
        <div className="platform-detail-heading">
          <div>
            <span>
              {approvalKindLabel(kind, copy)} · {record.reference}
            </span>
            <h2 id="submission-heading">{record.organizationName ?? record.applicantName}</h2>
          </div>
          <Badge variant={statusVariant(record.status)}>
            {approvalStatusLabel(record.status, copy)}
          </Badge>
        </div>
        <dl className="platform-detail-data platform-detail-data--identity">
          {record.identity.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="platform-detail-card" aria-labelledby="information-heading">
        <div className="platform-section-label">
          <FileText aria-hidden="true" size={15} />
          <h2 id="information-heading">{copy.submission}</h2>
        </div>
        <dl className="platform-detail-data">
          {record.submission.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="platform-detail-card" aria-labelledby="documents-heading">
        <div className="platform-section-label">
          <FileText aria-hidden="true" size={15} />
          <h2 id="documents-heading">{copy.documents}</h2>
        </div>
        <div className="platform-document-list">
          {record.documents.map((document) => (
            <div key={document.id}>
              <div>
                <strong>{document.label}</strong>
                <span>{document.category}</span>
              </div>
              <time dateTime={document.submittedAt}>
                {formatDate(document.submittedAt, locale)}
              </time>
              <Button asChild variant="outline" size="sm">
                <a href={document.viewUrl} target="_blank" rel="noreferrer">
                  {copy.viewDocument}
                </a>
              </Button>
            </div>
          ))}
        </div>
      </section>
      <section className="platform-detail-card" aria-labelledby="history-heading">
        <div className="platform-section-label">
          <UserRound aria-hidden="true" size={15} />
          <h2 id="history-heading">{copy.reviewHistory}</h2>
        </div>
        <ol className="platform-history">
          {record.timeline.map((event) => (
            <li key={event.id}>
              <div>
                <strong>{event.label}</strong>
                {event.note ? <span>{event.note}</span> : null}
              </div>
              <time dateTime={event.at}>{formatDate(event.at, locale)}</time>
            </li>
          ))}
        </ol>
      </section>
      {record.status === 'pending' ? (
        <section className="platform-review-actions" aria-label="Review actions">
          <p>{copy.auditRecorded}</p>
          <div>
            <Button variant="outline" onClick={() => setRejectOpen(true)}>
              {copy.reject}
            </Button>
            <Button onClick={() => setApproveOpen(true)}>{copy.approve}</Button>
          </div>
        </section>
      ) : null}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.confirmApproval}</DialogTitle>
            <DialogDescription>{copy.confirmApprovalDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              {copy.cancel}
            </Button>
            <Button onClick={handleApprove}>{copy.approve}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.rejectionTitle}</DialogTitle>
            <DialogDescription>{copy.rejectionDescription}</DialogDescription>
          </DialogHeader>
          <div className="platform-rejection-form">
            <div>
              <Label htmlFor="rejection-reason">{copy.rejectionReason}</Label>
              <Select
                id="rejection-reason"
                value={reason}
                aria-invalid={Boolean(formError && !reason)}
                onChange={(event) => {
                  setReason(event.target.value as RejectionReason);
                  setFormError('');
                }}
              >
                <option value="">—</option>
                {Object.entries(rejectionReasonLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label[language]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="rejection-note">{copy.rejectionNote}</Label>
              <Textarea
                id="rejection-note"
                value={note}
                aria-invalid={Boolean(formError && !note.trim())}
                placeholder={copy.notePlaceholder}
                onChange={(event) => {
                  setNote(event.target.value);
                  setFormError('');
                }}
              />
            </div>
            {formError ? <p role="alert">{formError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {copy.cancel}
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              {copy.reject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
