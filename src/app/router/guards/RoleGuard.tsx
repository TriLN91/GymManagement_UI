import { Navigate, Outlet } from 'react-router-dom';

import type { Role } from '@/entities/user';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ROUTES } from '@/shared/config/constants';

interface RoleGuardProps {
  allow: Role | ReadonlyArray<Role>;
}

export function RoleGuard({ allow }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  const list = Array.isArray(allow) ? allow : [allow];
  const allowed = user ? user.roles.some((r) => list.includes(r)) : false;

  if (!allowed) return <Navigate to={ROUTES.public.forbidden} replace />;
  return <Outlet />;
}
