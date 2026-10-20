import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthLayout } from './components/AuthLayout';

import { RegisterForm } from '@/features/auth/ui';

export function RegisterPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t('auth:register.title')} — FIT AI`;
  }, [t]);

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
