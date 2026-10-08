import { ROUTES } from '@/shared/config/constants';

const allowedTargets = new Set<string>([
  ROUTES.admin.pts,
  ROUTES.admin.orders,
  ROUTES.admin.settlements,
]);

export function isAllowedGymOwnerNotificationTarget(target: string | null): target is string {
  if (target === null || target.includes('?') || target.includes('#')) return false;
  if (allowedTargets.has(target)) return true;
  return /^\/admin\/orders\/[A-Za-z0-9-]+$/.test(target);
}
