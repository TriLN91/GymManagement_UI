import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { AuthLayout } from './components/AuthLayout';

import { authApi } from '@/features/auth/api/authApi';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z.object({ email: z.string().email('invalid') });
type FormValues = z.infer<typeof schema>;

// FR-IAM-06 AC4: identical response for existing and non-existing emails — prevent enumeration.
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    document.title = `${t('auth:forgot.title')} — FIT AI`;
  }, [t]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.forgotPassword(values.email);
    } finally {
      setSubmitted(true);
    }
  });

  return (
    <AuthLayout>
      <div className="w-full flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="font-syne text-4xl font-bold text-forest flex items-center mb-4">
            FIT<span className="text-sm align-top relative -top-2">®</span>
          </div>
          <h1 className="font-syne text-4xl font-bold text-forest mb-2">Khôi Phục.</h1>
          <p className="text-forest/70 text-sm font-medium">Nhập email đăng ký của bạn để nhận mã xác minh OTP bảo mật.</p>
        </div>

        {submitted ? (
          <div className="w-full text-center p-6 border border-mint bg-mint/5 rounded-xl">
            <p className="text-forest font-bold mb-2">Email Đã Được Gửi</p>
            <p className="text-sm text-forest/70">{t('auth:forgot.success')}</p>
            <Link to={ROUTES.public.login} className="text-xs text-forest/60 hover:text-forest transition-colors font-medium mt-6 block">
               &larr; Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-forest uppercase tracking-wider">Email tài khoản</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} className="bg-transparent border-forest/20 focus-visible:ring-forest text-forest h-12" placeholder="email@gmail.com" />
              {errors.email ? (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full bg-mint text-forest hover:bg-mint/90 rounded-full font-bold h-12 mt-6" disabled={isSubmitting}>
              Gửi mã xác nhận &rarr;
            </Button>

            <div className="pt-6 w-full text-center">
              <Link to={ROUTES.public.login} className="text-xs text-forest/60 hover:text-forest transition-colors font-medium">
                 &larr; Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
