import { ArrowLeft, FileText, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { usePlatformOperationsStore } from '../model/store';
import type { MarketplaceListingStatus } from '../model/types';

import { listingKindLabel, listingStatusLabel, operationsCopy, restrictionReasons } from './copy';

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

import './platform-operations.css';

function statusVariant(status: MarketplaceListingStatus) {
  return status === 'published'
    ? 'accent'
    : status === 'changes_requested'
      ? 'neutral'
      : 'destructive';
}
function useCopy() {
  const { i18n } = useTranslation();
  const language: 'en' | 'vi' = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  return {
    copy: operationsCopy[language],
    language,
    locale: language === 'vi' ? 'vi-VN' : 'en-US',
  };
}
function date(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function PlatformListingsPage() {
  const listings = usePlatformOperationsStore((state) => state.listings);
  const { copy, locale } = useCopy();
  return (
    <WorkspacePage width="wide" className="platform-operations-page">
      <h1 className="sr-only">{copy.listing}</h1>
      <div className="platform-operations-toolbar">
        <Badge variant="neutral">{copy.sample}</Badge>
        <span>
          {listings.length} {copy.listing.toLowerCase()}
        </span>
      </div>
      {listings.length === 0 ? (
        <EmptyState title={copy.noListings} />
      ) : (
        <div className="platform-listing-grid">
          {listings.map((listing) => (
            <article key={listing.id} className="platform-listing-card">
              <div>
                <Badge variant="neutral">{listingKindLabel(listing.kind, copy)}</Badge>
                <Badge variant={statusVariant(listing.status)}>
                  {listingStatusLabel(listing.status, copy)}
                </Badge>
              </div>
              <section>
                <span>{listing.reference}</span>
                <h2>{listing.name}</h2>
                <p>{listing.publisher}</p>
              </section>
              <footer>
                <time dateTime={listing.submittedAt}>{date(listing.submittedAt, locale)}</time>
                <Button asChild size="sm" variant="outline">
                  <Link to={ROUTES.superadmin.listingDetailPath(listing.id)}>{copy.detail}</Link>
                </Button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </WorkspacePage>
  );
}

export function PlatformListingDetailPage() {
  const { listingId } = useParams();
  const listing = usePlatformOperationsStore((state) =>
    state.listings.find((item) => item.id === listingId),
  );
  const moderate = usePlatformOperationsStore((state) => state.moderateListing);
  const { copy, language, locale } = useCopy();
  const [action, setAction] = useState<
    'changes_requested' | 'hidden' | 'suspended' | 'published' | null
  >(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  if (!listing)
    return (
      <WorkspacePage width="wide">
        <EmptyState
          title={copy.noListings}
          action={
            <Button asChild>
              <Link to={ROUTES.superadmin.listings}>{copy.back}</Link>
            </Button>
          }
        />
      </WorkspacePage>
    );
  const restricted = action && action !== 'published';
  const execute = () => {
    if (!action) return;
    if (restricted && (!reason || !note.trim())) {
      setError(copy.restrictionError);
      return;
    }
    if (moderate(listing.id, action, reason, note)) {
      setAction(null);
      setReason('');
      setNote('');
      toast.success(`${listing.reference} · ${listingStatusLabel(action, copy)}`);
    }
  };
  return (
    <WorkspacePage width="wide" className="platform-operations-page">
      <h1 className="sr-only">{listing.name}</h1>
      <div className="platform-operations-toolbar">
        <Button asChild size="sm" variant="ghost">
          <Link to={ROUTES.superadmin.listings}>
            <ArrowLeft aria-hidden="true" size={15} />
            {copy.back}
          </Link>
        </Button>
        <Badge variant="neutral">{copy.sample}</Badge>
      </div>
      <section className="platform-operation-detail">
        <header>
          <div>
            <span>
              {listingKindLabel(listing.kind, copy)} · {listing.reference}
            </span>
            <h2>{listing.name}</h2>
            <p>
              {copy.publisher}: {listing.publisher}
            </p>
          </div>
          <Badge variant={statusVariant(listing.status)}>
            {listingStatusLabel(listing.status, copy)}
          </Badge>
        </header>
        <dl>
          {listing.content.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="platform-operation-detail">
        <h2 className="platform-subheading">
          <FileText aria-hidden="true" size={15} />
          {copy.history}
        </h2>
        <ol className="platform-operation-history">
          {listing.history.map((event) => (
            <li key={event.id}>
              <div>
                <strong>{event.label}</strong>
                {event.note ? <span>{event.note}</span> : null}
              </div>
              <time dateTime={event.at}>{date(event.at, locale)}</time>
            </li>
          ))}
        </ol>
      </section>
      <section className="platform-moderation-actions">
        <div>
          <ShieldAlert aria-hidden="true" size={16} />
          <p>{copy.restrictionDescription}</p>
        </div>
        <div>
          {listing.status === 'published' ? (
            <>
              <Button variant="outline" onClick={() => setAction('changes_requested')}>
                {copy.requestChanges}
              </Button>
              <Button variant="outline" onClick={() => setAction('hidden')}>
                {copy.hide}
              </Button>
              <Button variant="destructive" onClick={() => setAction('suspended')}>
                {copy.suspend}
              </Button>
            </>
          ) : (
            <Button onClick={() => setAction('published')}>
              <RotateCcw aria-hidden="true" size={15} />
              {copy.restore}
            </Button>
          )}
        </div>
      </section>
      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{restricted ? copy.restrictionTitle : copy.confirmRestore}</DialogTitle>
            <DialogDescription>
              {restricted ? copy.restrictionDescription : copy.confirmRestoreDescription}
            </DialogDescription>
          </DialogHeader>
          {restricted ? (
            <div className="platform-restriction-form">
              <div>
                <Label htmlFor="listing-reason">{copy.restrictionReason}</Label>
                <Select
                  id="listing-reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                  }}
                >
                  <option value="">—</option>
                  {restrictionReasons[language].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="listing-note">{copy.restrictionNote}</Label>
                <Textarea
                  id="listing-note"
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setError('');
                  }}
                />
              </div>
              {error ? <p role="alert">{error}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              {copy.cancel}
            </Button>
            <Button variant={restricted ? 'destructive' : 'default'} onClick={execute}>
              {copy.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
