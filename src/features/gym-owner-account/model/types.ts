export interface LocalizedText {
  en: string;
  vi: string;
}

export type GymOwnerNotificationEvent =
  | 'purchase_payment'
  | 'trainer_approval'
  | 'offer_moderation'
  | 'settlement_refund_dispute'
  | 'platform_announcement';

export interface GymOwnerNotification {
  id: string;
  event: GymOwnerNotificationEvent;
  title: LocalizedText;
  message: LocalizedText;
  createdAt: string;
  initiallyRead: boolean;
  target: string | null;
}

export type ImportantActivityEvent =
  | 'sign_in_otp'
  | 'password_changed'
  | 'sensitive_profile_changed'
  | 'trainer_lifecycle_changed'
  | 'offer_lifecycle_changed'
  | 'refund_dispute_submitted';

export type ActivityResult = 'success' | 'submitted';

export interface ImportantActivityRecord {
  id: string;
  event: ImportantActivityEvent;
  occurredAt: string;
  activity: LocalizedText;
  context: LocalizedText;
  result: ActivityResult;
}

export type AccountResourceState<T> =
  | { state: 'loading' }
  | { state: 'loaded'; data: T }
  | { state: 'empty' }
  | { state: 'error'; message?: string };
