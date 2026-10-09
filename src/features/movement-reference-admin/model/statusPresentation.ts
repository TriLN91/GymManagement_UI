import type { BadgeProps } from '@/shared/ui/badge/Badge';

export type MovementStatusKind = 'lifecycle' | 'processing' | 'decision' | 'action';

const FRIENDLY_KEYS: Readonly<Record<string, string>> = {
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  REVIEW_REQUIRED: 'reviewRequired',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  FAILED: 'failed',
  CLEAR_ACCEPT: 'accepted',
  CLEAR_REJECT: 'rejected',
  AMBIGUOUS: 'ambiguous',
  REQUIRES_REVIEW: 'needsReview',
  KEEP: 'keep',
  DOWN_WEIGHT: 'downWeight',
  EXCLUDE: 'exclude',
};

export function statusLabelKey(value: string): string {
  return `status.${FRIENDLY_KEYS[value] ?? 'unknown'}`;
}

export function statusVariant(value: string): BadgeProps['variant'] {
  if (['ACTIVE', 'PROCESSED', 'CLEAR_ACCEPT', 'KEEP'].includes(value)) return 'accent';
  if (['FAILED', 'CLEAR_REJECT', 'EXCLUDE'].includes(value)) return 'destructive';
  if (['REVIEW_REQUIRED', 'REQUIRES_REVIEW', 'AMBIGUOUS', 'DOWN_WEIGHT'].includes(value)) {
    return 'default';
  }
  return 'neutral';
}
