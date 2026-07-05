import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ROUTES } from '@/shared/config/constants';

export function TenantGuard() {
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  if (!tenantId) return <Navigate to={ROUTES.public.login} replace />;
  return <Outlet />;
}
