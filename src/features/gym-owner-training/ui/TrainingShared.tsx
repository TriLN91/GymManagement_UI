import type { ReactNode } from 'react';

import type { TrainerApprovalStatus, TrainerOperationalStatus } from '../model/types';

import type { GymOwnerTrainingCopy } from './copy';

import { Badge } from '@/shared/ui/badge';

export function TrainerAvatar({
  name,
  source,
  large = false,
}: {
  name: string;
  source?: string | null;
  large?: boolean;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <span className={`gym-trainer-avatar${large ? 'is-large' : ''}`}>
      {source ? <img src={source} alt="" /> : initials || 'PT'}
    </span>
  );
}

export function ApprovalBadge({
  status,
  copy,
}: {
  status: TrainerApprovalStatus;
  copy: GymOwnerTrainingCopy;
}) {
  const variant =
    status === 'approved'
      ? 'accent'
      : status === 'rejected'
        ? 'destructive'
        : status === 'pending'
          ? 'default'
          : 'neutral';
  return <Badge variant={variant}>{copy.approval[status]}</Badge>;
}

export function OperationalBadge({
  status,
  copy,
}: {
  status: TrainerOperationalStatus | null;
  copy: GymOwnerTrainingCopy;
}) {
  const variant =
    status === 'active'
      ? 'accent'
      : status === 'suspended'
        ? 'destructive'
        : status === 'hidden' || status === 'unlinked'
          ? 'neutral'
          : 'neutral';
  return (
    <Badge variant={variant}>
      {status ? copy.operational[status] : copy.operational.unavailable}
    </Badge>
  );
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
