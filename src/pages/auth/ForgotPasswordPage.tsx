import { useEffect } from 'react';

import { AuthLayout } from './components/AuthLayout';

import { ForgotPasswordWizard } from '@/features/auth/ui';

export function ForgotPasswordPage() {
  useEffect(() => {
    document.title = 'Quên mật khẩu & Xác thực OTP — FIT AI';
  }, []);

  return (
    <AuthLayout>
      <ForgotPasswordWizard />
    </AuthLayout>
  );
}
