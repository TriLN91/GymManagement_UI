import type { MarketplaceListing, PlatformCampaign, PlatformNotification } from './types';

export const initialMarketplaceListings: ReadonlyArray<MarketplaceListing> = [
  {
    id: 'listing-gym-801',
    kind: 'gym_profile',
    reference: 'GYM-801',
    name: 'Pulse Collective',
    publisher: 'Pulse Collective',
    submittedAt: '2026-10-07T04:35:00.000Z',
    status: 'published',
    content: [
      { label: 'Public name', value: 'Pulse Collective' },
      { label: 'Location', value: 'District 3, Ho Chi Minh City' },
      { label: 'Description', value: 'Small-group strength and mobility training.' },
    ],
    history: [{ id: 'listing-801-published', at: '2026-09-28T08:00:00.000Z', label: 'Published' }],
  },
  {
    id: 'listing-trainer-802',
    kind: 'trainer_profile',
    reference: 'TR-802',
    name: 'Hana Do',
    publisher: 'Northstar Fitness',
    submittedAt: '2026-10-06T09:10:00.000Z',
    status: 'published',
    content: [
      { label: 'Public name', value: 'Hana Do' },
      { label: 'Linked gym', value: 'Northstar Fitness' },
      { label: 'Coaching focus', value: 'Strength training' },
    ],
    history: [{ id: 'listing-802-published', at: '2026-09-30T08:00:00.000Z', label: 'Published' }],
  },
  {
    id: 'listing-offer-803',
    kind: 'offer',
    reference: 'OFF-803',
    name: '12-class strength pass',
    publisher: 'Pulse Collective',
    submittedAt: '2026-10-05T06:00:00.000Z',
    status: 'changes_requested',
    content: [
      { label: 'Offer type', value: 'Class' },
      { label: 'Gym', value: 'Pulse Collective' },
      { label: 'Public summary', value: 'Twelve coach-led strength classes.' },
    ],
    history: [
      { id: 'listing-803-published', at: '2026-09-23T09:00:00.000Z', label: 'Published' },
      {
        id: 'listing-803-changes',
        at: '2026-10-05T06:00:00.000Z',
        label: 'Changes requested',
        note: 'Clarify included class access.',
      },
    ],
    restriction: {
      action: 'changes_requested',
      reason: 'Information needs clarification',
      note: 'Clarify included class access.',
    },
  },
  {
    id: 'listing-package-804',
    kind: 'pt_package',
    reference: 'PT-804',
    name: 'Foundations coaching',
    publisher: 'Northstar Fitness',
    submittedAt: '2026-10-03T03:25:00.000Z',
    status: 'hidden',
    content: [
      { label: 'Package', value: 'Foundations coaching' },
      { label: 'Trainer', value: 'Hana Do' },
      { label: 'Public summary', value: 'Eight guided coaching sessions.' },
    ],
    history: [
      { id: 'listing-804-published', at: '2026-09-20T09:00:00.000Z', label: 'Published' },
      {
        id: 'listing-804-hidden',
        at: '2026-10-03T03:25:00.000Z',
        label: 'Hidden',
        note: 'Public copy requires correction.',
      },
    ],
    restriction: {
      action: 'hidden',
      reason: 'Content requires correction',
      note: 'Public copy requires correction.',
    },
  },
];

export const initialPlatformCampaigns: ReadonlyArray<PlatformCampaign> = [
  {
    id: 'campaign-501',
    name: 'October movement week',
    audience: 'member',
    message: 'Discover the weekly training schedule and keep your streak moving.',
    startsAt: '2026-10-12T01:00:00.000Z',
    endsAt: '2026-10-19T15:00:00.000Z',
    status: 'scheduled',
    history: [
      { id: 'campaign-501-created', at: '2026-10-02T07:00:00.000Z', label: 'Created' },
      { id: 'campaign-501-scheduled', at: '2026-10-02T07:10:00.000Z', label: 'Scheduled' },
    ],
  },
  {
    id: 'campaign-502',
    name: 'Gym onboarding reminder',
    audience: 'gym_owner',
    message: 'Complete the onboarding information required to publish services.',
    startsAt: '2026-10-01T01:00:00.000Z',
    endsAt: '2026-10-31T15:00:00.000Z',
    status: 'active',
    history: [
      { id: 'campaign-502-created', at: '2026-09-29T06:00:00.000Z', label: 'Created' },
      { id: 'campaign-502-active', at: '2026-10-01T01:00:00.000Z', label: 'Activated' },
    ],
  },
];

export const initialPlatformNotifications: ReadonlyArray<PlatformNotification> = [
  {
    id: 'notice-301',
    title: 'Offer requires a follow-up',
    body: 'The 12-class strength pass has a requested content clarification.',
    createdAt: '2026-10-05T06:00:00.000Z',
    read: false,
    target: { type: 'listing', id: 'listing-offer-803' },
  },
  {
    id: 'notice-302',
    title: 'Campaign starts soon',
    body: 'October movement week is scheduled to begin next week.',
    createdAt: '2026-10-07T01:00:00.000Z',
    read: false,
    target: { type: 'campaign', id: 'campaign-501' },
  },
];
