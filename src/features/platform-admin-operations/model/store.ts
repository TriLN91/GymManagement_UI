import { create } from 'zustand';

import {
  initialMarketplaceListings,
  initialPlatformCampaigns,
  initialPlatformNotifications,
} from './mockData';
import type {
  MarketplaceListing,
  MarketplaceListingStatus,
  PlatformCampaign,
  PlatformCampaignAudience,
  PlatformCampaignStatus,
  PlatformNotification,
} from './types';

import { usePlatformApprovalStore } from '@/features/platform-admin-approvals/model/store';

export const campaignTransitions: Readonly<
  Record<PlatformCampaignStatus, ReadonlyArray<PlatformCampaignStatus>>
> = {
  draft: ['scheduled', 'active', 'archived'],
  scheduled: ['active', 'paused', 'archived'],
  active: ['paused', 'ended'],
  paused: ['active', 'ended', 'archived'],
  ended: ['archived'],
  archived: [],
};

interface CampaignDraft {
  name: string;
  audience: PlatformCampaignAudience;
  message: string;
  startsAt: string;
  endsAt: string;
}

interface PlatformOperationsState {
  listings: ReadonlyArray<MarketplaceListing>;
  campaigns: ReadonlyArray<PlatformCampaign>;
  notifications: ReadonlyArray<PlatformNotification>;
  moderateListing: (
    id: string,
    action: 'changes_requested' | 'hidden' | 'suspended' | 'published',
    reason?: string,
    note?: string,
  ) => boolean;
  createCampaign: (draft: CampaignDraft) => string;
  updateCampaign: (id: string, draft: CampaignDraft) => boolean;
  transitionCampaign: (id: string, status: PlatformCampaignStatus) => boolean;
  markNotificationRead: (id: string) => void;
}

function auditListing(
  id: string,
  action: 'listing_changes_requested' | 'listing_hidden' | 'listing_suspended' | 'listing_restored',
  fromStatus: MarketplaceListingStatus,
  toStatus: MarketplaceListingStatus,
  reason?: string,
  note?: string,
) {
  usePlatformApprovalStore.getState().recordAudit({
    action,
    subjectType: 'listing',
    subjectId: id,
    metadata: { fromStatus, toStatus, reason, note },
  });
}

export const usePlatformOperationsStore = create<PlatformOperationsState>((set) => ({
  listings: initialMarketplaceListings,
  campaigns: initialPlatformCampaigns,
  notifications: initialPlatformNotifications,
  moderateListing: (id, action, reason, note) => {
    const current = usePlatformOperationsStore.getState().listings.find((item) => item.id === id);
    if (!current || current.status === action) return false;
    const restricted = action !== 'published';
    if (restricted && (!reason?.trim() || !note?.trim())) return false;
    const at = new Date().toISOString();
    const label =
      action === 'changes_requested'
        ? 'Changes requested'
        : action === 'hidden'
          ? 'Hidden'
          : action === 'suspended'
            ? 'Suspended'
            : 'Restored and published';
    const auditAction =
      action === 'changes_requested'
        ? 'listing_changes_requested'
        : action === 'hidden'
          ? 'listing_hidden'
          : action === 'suspended'
            ? 'listing_suspended'
            : 'listing_restored';
    set((state) => ({
      listings: state.listings.map((item) =>
        item.id === id
          ? {
              ...item,
              status: action,
              restriction:
                action === 'published'
                  ? undefined
                  : { action, reason: reason as string, note: note as string },
              history: [
                ...item.history,
                { id: `listing-event-${crypto.randomUUID()}`, at, label, note: note?.trim() },
              ],
            }
          : item,
      ),
      notifications: [
        {
          id: `notice-${crypto.randomUUID()}`,
          title: `${current.reference} · ${label}`,
          body: action === 'published' ? 'The listing is published again.' : (note?.trim() ?? ''),
          createdAt: at,
          read: false,
          target: { type: 'listing', id },
        },
        ...state.notifications,
      ],
    }));
    auditListing(id, auditAction, current.status, action, reason?.trim(), note?.trim());
    return true;
  },
  createCampaign: (draft) => {
    const id = `campaign-${crypto.randomUUID()}`;
    const at = new Date().toISOString();
    set((state) => ({
      campaigns: [
        {
          id,
          ...draft,
          status: 'draft',
          history: [{ id: `campaign-event-${crypto.randomUUID()}`, at, label: 'Created as draft' }],
        },
        ...state.campaigns,
      ],
    }));
    usePlatformApprovalStore.getState().recordAudit({
      action: 'campaign_created',
      subjectType: 'campaign',
      subjectId: id,
      metadata: { toStatus: 'draft' },
    });
    return id;
  },
  updateCampaign: (id, draft) => {
    const current = usePlatformOperationsStore.getState().campaigns.find((item) => item.id === id);
    if (!current || !['draft', 'scheduled', 'paused'].includes(current.status)) return false;
    const at = new Date().toISOString();
    set((state) => ({
      campaigns: state.campaigns.map((item) =>
        item.id === id
          ? {
              ...item,
              ...draft,
              history: [
                ...item.history,
                {
                  id: `campaign-event-${crypto.randomUUID()}`,
                  at,
                  label: 'Campaign details updated',
                },
              ],
            }
          : item,
      ),
    }));
    usePlatformApprovalStore.getState().recordAudit({
      action: 'campaign_updated',
      subjectType: 'campaign',
      subjectId: id,
      metadata: { fromStatus: current.status, toStatus: current.status },
    });
    return true;
  },
  transitionCampaign: (id, status) => {
    const current = usePlatformOperationsStore.getState().campaigns.find((item) => item.id === id);
    if (!current || !campaignTransitions[current.status].includes(status)) return false;
    const at = new Date().toISOString();
    set((state) => ({
      campaigns: state.campaigns.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              history: [
                ...item.history,
                {
                  id: `campaign-event-${crypto.randomUUID()}`,
                  at,
                  label: `Status changed to ${status}`,
                },
              ],
            }
          : item,
      ),
      notifications: [
        {
          id: `notice-${crypto.randomUUID()}`,
          title: `${current.name} · ${status}`,
          body: 'Campaign status was updated.',
          createdAt: at,
          read: false,
          target: { type: 'campaign', id },
        },
        ...state.notifications,
      ],
    }));
    usePlatformApprovalStore.getState().recordAudit({
      action: 'campaign_status_changed',
      subjectType: 'campaign',
      subjectId: id,
      metadata: { fromStatus: current.status, toStatus: status },
    });
    return true;
  },
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    })),
}));

export type { CampaignDraft };
