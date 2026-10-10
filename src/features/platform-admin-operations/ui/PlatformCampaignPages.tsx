import { ArrowLeft, Bell, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  campaignTransitions,
  usePlatformOperationsStore,
  type CampaignDraft,
} from '../model/store';
import type { PlatformCampaignStatus } from '../model/types';

import { audienceLabel, campaignStatusLabel, operationsCopy } from './copy';

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
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage } from '@/shared/ui/workspace';

import './platform-operations.css';

function useCopy() {
  const { i18n } = useTranslation();
  const language: 'en' | 'vi' = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  return { copy: operationsCopy[language], locale: language === 'vi' ? 'vi-VN' : 'en-US' };
}
function statusVariant(status: PlatformCampaignStatus) {
  return status === 'active'
    ? 'accent'
    : status === 'archived' || status === 'ended'
      ? 'neutral'
      : 'default';
}
function displayDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
function toInputDate(value: string) {
  return value.slice(0, 16);
}

export function PlatformCampaignsPage() {
  const campaigns = usePlatformOperationsStore((state) => state.campaigns);
  const { copy, locale } = useCopy();
  return (
    <WorkspacePage width="wide" className="platform-operations-page">
      <h1 className="sr-only">{copy.campaigns}</h1>
      <div className="platform-operations-toolbar">
        <Badge variant="neutral">{copy.sample}</Badge>
        <Button asChild>
          <Link to={ROUTES.superadmin.campaignCreate}>
            <Plus aria-hidden="true" size={15} />
            {copy.createCampaign}
          </Link>
        </Button>
      </div>
      {campaigns.length === 0 ? (
        <EmptyState title={copy.noCampaigns} />
      ) : (
        <div className="platform-campaign-list">
          {campaigns.map((campaign) => (
            <article key={campaign.id}>
              <div>
                <Badge variant={statusVariant(campaign.status)}>
                  {campaignStatusLabel(campaign.status, copy)}
                </Badge>
                <span>{audienceLabel(campaign.audience, copy)}</span>
              </div>
              <section>
                <h2>{campaign.name}</h2>
                <p>{campaign.message}</p>
              </section>
              <footer>
                <time>
                  {displayDate(campaign.startsAt, locale)} — {displayDate(campaign.endsAt, locale)}
                </time>
                <Button asChild size="sm" variant="outline">
                  <Link to={ROUTES.superadmin.campaignDetailPath(campaign.id)}>{copy.detail}</Link>
                </Button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </WorkspacePage>
  );
}

export function PlatformCampaignFormPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const campaigns = usePlatformOperationsStore((state) => state.campaigns);
  const createCampaign = usePlatformOperationsStore((state) => state.createCampaign);
  const updateCampaign = usePlatformOperationsStore((state) => state.updateCampaign);
  const campaign = campaignId ? campaigns.find((item) => item.id === campaignId) : undefined;
  const { copy } = useCopy();
  const [draft, setDraft] = useState<CampaignDraft>(() =>
    campaign
      ? {
          name: campaign.name,
          audience: campaign.audience,
          message: campaign.message,
          startsAt: toInputDate(campaign.startsAt),
          endsAt: toInputDate(campaign.endsAt),
        }
      : { name: '', audience: 'member', message: '', startsAt: '', endsAt: '' },
  );
  const [error, setError] = useState('');
  if (campaignId && !campaign)
    return (
      <WorkspacePage width="wide">
        <EmptyState
          title={copy.noCampaigns}
          action={
            <Button asChild>
              <Link to={ROUTES.superadmin.campaigns}>{copy.back}</Link>
            </Button>
          }
        />
      </WorkspacePage>
    );
  const submit = () => {
    if (
      !draft.name.trim() ||
      !draft.message.trim() ||
      !draft.startsAt ||
      !draft.endsAt ||
      new Date(draft.endsAt) <= new Date(draft.startsAt)
    ) {
      setError(copy.invalidCampaign);
      return;
    }
    const normalized = {
      ...draft,
      name: draft.name.trim(),
      message: draft.message.trim(),
      startsAt: new Date(draft.startsAt).toISOString(),
      endsAt: new Date(draft.endsAt).toISOString(),
    };
    if (campaign) {
      if (!updateCampaign(campaign.id, normalized)) {
        setError(copy.cannotEdit);
        return;
      }
      toast.success(copy.save);
      void navigate(ROUTES.superadmin.campaignDetailPath(campaign.id));
    } else {
      const id = createCampaign(normalized);
      toast.success(copy.save);
      void navigate(ROUTES.superadmin.campaignDetailPath(id));
    }
  };
  return (
    <WorkspacePage width="default" className="platform-operations-page">
      <h1 className="sr-only">{campaign ? copy.editCampaign : copy.createCampaign}</h1>
      <div className="platform-operations-toolbar">
        <Button asChild size="sm" variant="ghost">
          <Link
            to={
              campaign
                ? ROUTES.superadmin.campaignDetailPath(campaign.id)
                : ROUTES.superadmin.campaigns
            }
          >
            <ArrowLeft aria-hidden="true" size={15} />
            {copy.back}
          </Link>
        </Button>
      </div>
      <form
        className="platform-campaign-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div>
          <Label htmlFor="campaign-name">{copy.name}</Label>
          <Input
            id="campaign-name"
            value={draft.name}
            onChange={(e) => {
              setDraft({ ...draft, name: e.target.value });
              setError('');
            }}
          />
        </div>
        <div>
          <Label htmlFor="campaign-audience">{copy.audience}</Label>
          <Select
            id="campaign-audience"
            value={draft.audience}
            onChange={(e) =>
              setDraft({ ...draft, audience: e.target.value as CampaignDraft['audience'] })
            }
          >
            <option value="member">{copy.member}</option>
            <option value="gym_owner">{copy.gymOwner}</option>
            <option value="trainer">{copy.trainer}</option>
          </Select>
        </div>
        <div className="is-wide">
          <Label htmlFor="campaign-message">{copy.message}</Label>
          <Textarea
            id="campaign-message"
            value={draft.message}
            onChange={(e) => {
              setDraft({ ...draft, message: e.target.value });
              setError('');
            }}
          />
        </div>
        <div>
          <Label htmlFor="campaign-start">{copy.startsAt}</Label>
          <Input
            id="campaign-start"
            type="datetime-local"
            value={draft.startsAt}
            onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="campaign-end">{copy.endsAt}</Label>
          <Input
            id="campaign-end"
            type="datetime-local"
            value={draft.endsAt}
            onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
          />
        </div>
        {error ? <p role="alert">{error}</p> : null}
        <footer>
          <Button type="submit">
            <Save aria-hidden="true" size={15} />
            {copy.save}
          </Button>
        </footer>
      </form>
    </WorkspacePage>
  );
}

export function PlatformCampaignDetailPage() {
  const { campaignId } = useParams();
  const campaigns = usePlatformOperationsStore((state) => state.campaigns);
  const transition = usePlatformOperationsStore((state) => state.transitionCampaign);
  const campaign = campaigns.find((item) => item.id === campaignId);
  const { copy, locale } = useCopy();
  const [next, setNext] = useState<PlatformCampaignStatus | null>(null);
  if (!campaign)
    return (
      <WorkspacePage width="wide">
        <EmptyState
          title={copy.noCampaigns}
          action={
            <Button asChild>
              <Link to={ROUTES.superadmin.campaigns}>{copy.back}</Link>
            </Button>
          }
        />
      </WorkspacePage>
    );
  const possible = campaignTransitions[campaign.status];
  const confirm = () => {
    if (next && transition(campaign.id, next)) {
      toast.success(campaignStatusLabel(next, copy));
      setNext(null);
    }
  };
  return (
    <WorkspacePage width="wide" className="platform-operations-page">
      <h1 className="sr-only">{campaign.name}</h1>
      <div className="platform-operations-toolbar">
        <Button asChild size="sm" variant="ghost">
          <Link to={ROUTES.superadmin.campaigns}>
            <ArrowLeft aria-hidden="true" size={15} />
            {copy.back}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={!['draft', 'scheduled', 'paused'].includes(campaign.status)}
        >
          <Link to={ROUTES.superadmin.campaignEditPath(campaign.id)}>{copy.editCampaign}</Link>
        </Button>
      </div>
      <section className="platform-operation-detail">
        <header>
          <div>
            <span>{audienceLabel(campaign.audience, copy)}</span>
            <h2>{campaign.name}</h2>
            <p>{campaign.message}</p>
          </div>
          <Badge variant={statusVariant(campaign.status)}>
            {campaignStatusLabel(campaign.status, copy)}
          </Badge>
        </header>
        <dl>
          <div>
            <dt>{copy.startsAt}</dt>
            <dd>{displayDate(campaign.startsAt, locale)}</dd>
          </div>
          <div>
            <dt>{copy.endsAt}</dt>
            <dd>{displayDate(campaign.endsAt, locale)}</dd>
          </div>
          <div>
            <dt>{copy.audience}</dt>
            <dd>{audienceLabel(campaign.audience, copy)}</dd>
          </div>
        </dl>
      </section>
      <section className="platform-operation-detail">
        <h2 className="platform-subheading">{copy.history}</h2>
        <ol className="platform-operation-history">
          {campaign.history.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <time>{displayDate(item.at, locale)}</time>
            </li>
          ))}
        </ol>
      </section>
      {possible.length > 0 ? (
        <section className="platform-campaign-transitions">
          <span>{copy.transition}</span>
          <div>
            {possible.map((status) => (
              <Button key={status} variant="outline" onClick={() => setNext(status)}>
                {campaignStatusLabel(status, copy)}
              </Button>
            ))}
          </div>
        </section>
      ) : null}
      <Dialog open={Boolean(next)} onOpenChange={(open) => !open && setNext(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.transition}</DialogTitle>
            <DialogDescription>{next ? campaignStatusLabel(next, copy) : ''}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNext(null)}>
              {copy.cancel}
            </Button>
            <Button onClick={confirm}>{copy.confirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}

export function PlatformNotificationsPage() {
  const { copy, locale } = useCopy();
  const notifications = usePlatformOperationsStore((state) => state.notifications);
  const markRead = usePlatformOperationsStore((state) => state.markNotificationRead);
  const navigate = useNavigate();
  const open = (id: string, target: { type: 'listing' | 'campaign'; id: string }) => {
    markRead(id);
    void navigate(
      target.type === 'listing'
        ? ROUTES.superadmin.listingDetailPath(target.id)
        : ROUTES.superadmin.campaignDetailPath(target.id),
    );
  };
  return (
    <WorkspacePage width="wide" className="platform-operations-page">
      <h1 className="sr-only">{copy.notifications}</h1>
      {notifications.length === 0 ? (
        <EmptyState title={copy.noNotifications} />
      ) : (
        <section className="platform-notification-list" aria-label={copy.notifications}>
          {notifications.map((notice) => (
            <article key={notice.id} className={notice.read ? 'is-read' : ''}>
              <Bell aria-hidden="true" size={17} />
              <div>
                <strong>{notice.title}</strong>
                <p>{notice.body}</p>
                <time>{displayDate(notice.createdAt, locale)}</time>
              </div>
              <Button size="sm" variant="outline" onClick={() => open(notice.id, notice.target)}>
                {copy.markRead}
              </Button>
            </article>
          ))}
        </section>
      )}
    </WorkspacePage>
  );
}
