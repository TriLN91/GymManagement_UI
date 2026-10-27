import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';

export function SuperAdminTenantsPage() {
  return <Navigate to={ROUTES.superadmin.activeGyms} replace />;
}
