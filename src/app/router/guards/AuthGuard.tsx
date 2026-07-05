import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ROUTES } from '@/shared/config/constants';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.public.login} replace state={{ returnTo: location.pathname }} />;
  }
  // Errors inside any protected subtree (portals + pages) are isolated so
  // a single broken page doesn't blank the whole authenticated app. The
  // outer ErrorBoundary in App.tsx remains the last-resort net.
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}