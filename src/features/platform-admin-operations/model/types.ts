export type MarketplaceListingKind = 'gym_profile' | 'trainer_profile' | 'offer' | 'pt_package';
export type MarketplaceListingStatus = 'published' | 'changes_requested' | 'hidden' | 'suspended';
export type PlatformCampaignAudience = 'member' | 'gym_owner' | 'trainer';
export type PlatformCampaignStatus =
  'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'archived';

export interface MarketplaceListing {
  id: string;
  kind: MarketplaceListingKind;
  reference: string;
  name: string;
  publisher: string;
  submittedAt: string;
  status: MarketplaceListingStatus;
  content: ReadonlyArray<{ label: string; value: string }>;
  history: ReadonlyArray<{ id: string; at: string; label: string; note?: string }>;
  restriction?: {
    action: 'changes_requested' | 'hidden' | 'suspended';
    reason: string;
    note: string;
  };
}

export interface PlatformCampaign {
  id: string;
  name: string;
  audience: PlatformCampaignAudience;
  message: string;
  startsAt: string;
  endsAt: string;
  status: PlatformCampaignStatus;
  history: ReadonlyArray<{ id: string; at: string; label: string }>;
}

export interface PlatformNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  target: { type: 'listing' | 'campaign'; id: string };
}
