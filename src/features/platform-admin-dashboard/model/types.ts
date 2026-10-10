export const PLATFORM_WIDGET_IDS = ['approvals', 'moderation', 'disputes', 'alerts'] as const;

export type PlatformWidgetId = (typeof PLATFORM_WIDGET_IDS)[number];
export type PlatformItemKind =
  | 'gymApplication'
  | 'legalChange'
  | 'trainerApplication'
  | 'offerListing'
  | 'trainerListing'
  | 'refundRequest'
  | 'orderDispute'
  | 'settlementException';
export type PlatformItemPriority = 'standard' | 'attention' | 'critical';

export interface PlatformQueueItem {
  id: string;
  kind: PlatformItemKind;
  reference: string;
  priority: PlatformItemPriority;
}

export interface PlatformDashboardData {
  approvals: PlatformQueueItem[];
  moderation: PlatformQueueItem[];
  disputes: PlatformQueueItem[];
  alerts: PlatformQueueItem[];
}

export type PlatformDashboardResource =
  | { state: 'loading' }
  | { state: 'loaded'; data: PlatformDashboardData }
  | { state: 'empty' }
  | { state: 'error' };

export interface PlatformDashboardPreferences {
  order: PlatformWidgetId[];
  hidden: PlatformWidgetId[];
}
