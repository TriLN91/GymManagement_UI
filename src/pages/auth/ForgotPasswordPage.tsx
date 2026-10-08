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
      <div className="flex w-full flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex items-center font-syne text-4xl font-bold text-forest">
            FIT<span className="relative -top-2 align-top text-sm">®</span>
          </div>
          <h1 className="mb-2 font-syne text-4xl font-bold text-forest">Khôi Phục.</h1>
          <p className="text-sm font-medium text-forest/70">
            Nhập email đăng ký của bạn để nhận mã xác minh OTP bảo mật.
          </p>
        </div>

        {submitted ? (
          <div className="bg-mint/5 w-full rounded-xl border border-mint p-6 text-center">
            <p className="mb-2 font-bold text-forest">Email Đã Được Gửi</p>
            <p className="text-sm text-forest/70">{t('auth:forgot.success')}</p>
            <Link
              to={ROUTES.public.login}
              className="mt-6 block text-xs font-medium text-forest/60 transition-colors hover:text-forest"
            >
              &larr; Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-forest"
              >
                Email tài khoản
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
                placeholder="email@gmail.com"
              />
              {errors.email ? (
                <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="hover:bg-mint/90 mt-6 h-12 w-full rounded-full bg-mint font-bold text-forest"
              disabled={isSubmitting}
            >
              Gửi mã xác nhận &rarr;
            </Button>

            <div className="w-full pt-6 text-center">
              <Link
                to={ROUTES.public.login}
                className="text-xs font-medium text-forest/60 transition-colors hover:text-forest"
              >
                &larr; Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
