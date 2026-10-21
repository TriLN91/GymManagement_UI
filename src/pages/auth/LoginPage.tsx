import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { AuthLayout } from './components/AuthLayout';

import { portalForRole } from '@/features/auth/model/loginDestination';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { LoginForm } from '@/features/auth/ui/LoginForm';

export function LoginPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    document.title = `${t('auth:login.title')} — FIT AI`;
  }, [t]);

  if (isAuthenticated && user) return <Navigate to={portalForRole(user.roles)} replace />;

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
