import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  useBranchesToReview,
  useDecideBranch,
  useDecideOffer,
  useOffersToReview,
} from '../model/useMarketplaceReview';

import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { WorkspacePage, WorkspacePanel } from '@/shared/ui/workspace';

const errorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

/** Approve or reject with a reason; the reason is required to reject and is sent to the Gym owner. */
function DecisionButtons({
  busy,
  onDecide,
}: {
  busy: boolean;
  onDecide: (approve: boolean, reason?: string) => void;
}) {
  const { t } = useTranslation('marketplaceReview');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (rejecting) {
    return (
      <span style={{ display: 'inline-flex', gap: 8 }}>
        <Input
          aria-label={t('reason')}
          placeholder={t('reason')}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={busy || reason.trim() === ''}
          onClick={() => onDecide(false, reason.trim())}
        >
          {t('confirmReject')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
          {t('back')}
        </Button>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', gap: 8 }}>
      <Button size="sm" disabled={busy} onClick={() => onDecide(true)}>
        {t('approve')}
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
        {t('reject')}
      </Button>
    </span>
  );
}

/** Platform Admin queue of branches and offers waiting for review (they stay hidden from the marketplace until approved). */
export function MarketplaceReviewPage() {
  const { t } = useTranslation('marketplaceReview');
  const { locale } = useLocale();
  const branches = useBranchesToReview();
  const offers = useOffersToReview();
  const decideBranch = useDecideBranch();
  const decideOffer = useDecideOffer();
  const money = (value: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

  return (
    <WorkspacePage className="gym-training-page">
      <h1>{t('title')}</h1>

      <WorkspacePanel>
        <h2>{t('branches')}</h2>
        {branches.isPending ? <p role="status">{t('loading')}</p> : null}
        {branches.isError ? <p role="alert">{t('loadFailed')}</p> : null}
        {branches.isSuccess && branches.data.length === 0 ? <p>{t('emptyBranches')}</p> : null}
        <ul className="space-y-2">
          {(branches.data ?? []).map((branch) => (
            <li key={branch.id} data-testid="branch-review">
              <strong>{branch.name}</strong> · {branch.gymName} · {branch.addressLine1},{' '}
              {branch.city}
              {' · '}
              <DecisionButtons
                busy={decideBranch.isPending}
                onDecide={(approve, reason) =>
                  decideBranch.mutate(
                    { id: branch.id, approve, reason },
                    {
                      onSuccess: () => toast.success(approve ? t('approved') : t('rejected')),
                      onError: (error) => toast.error(errorText(error, t('failed'))),
                    },
                  )
                }
              />
            </li>
          ))}
        </ul>
      </WorkspacePanel>

      <WorkspacePanel>
        <h2>{t('offers')}</h2>
        {offers.isPending ? <p role="status">{t('loading')}</p> : null}
        {offers.isError ? <p role="alert">{t('loadFailed')}</p> : null}
        {offers.isSuccess && offers.data.length === 0 ? <p>{t('emptyOffers')}</p> : null}
        <ul className="space-y-2">
          {(offers.data ?? []).map((offer) => (
            <li key={offer.id} data-testid="offer-review">
              <strong>{offer.title}</strong> · {offer.gymName}
              {offer.branchName ? ` · ${offer.branchName}` : ''} ·{' '}
              {money(offer.price, offer.currencyCode)}
              {' · '}
              <DecisionButtons
                busy={decideOffer.isPending}
                onDecide={(approve, reason) =>
                  decideOffer.mutate(
                    { id: offer.id, approve, reason },
                    {
                      onSuccess: () => toast.success(approve ? t('approved') : t('rejected')),
                      onError: (error) => toast.error(errorText(error, t('failed'))),
                    },
                  )
                }
              />
            </li>
          ))}
        </ul>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
