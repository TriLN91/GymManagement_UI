import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { ROUTES } from '@/shared/config/constants';

const portalForRole = (roles: ReadonlyArray<string>): string => {
  if (roles.includes('super_admin')) return ROUTES.superadmin.root;
  if (roles.includes('gym_admin')) return ROUTES.admin.root;
  if (roles.includes('pt')) return ROUTES.pt.root;
  return ROUTES.member.root;
};

export function LoginPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    document.title = `${t('auth:login.title')} — AI Fitness Coaching`;
  }, [t]);

  if (user) return <Navigate to={portalForRole(user.roles)} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
