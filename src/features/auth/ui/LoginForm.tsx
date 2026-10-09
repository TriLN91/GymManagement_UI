import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { resolveLoginDestination } from '../model/loginDestination';
import { useLogin } from '../model/useAuth';

import { AuthError, ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { env } from '@/shared/config/env';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z.object({
  email: z.string().email('auth:errors.invalidEmail'),
  password: z.string().min(1, 'auth:errors.invalidCredentials'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await login.mutateAsync(values);
      const returnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
      void navigate(resolveLoginDestination(session.user.roles, returnTo), { replace: true });
    } catch (error) {
      if (error instanceof ValidationError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if (messages[0]) setError(field as keyof FormValues, { message: messages[0] });
        }
        return;
      }
      if (error instanceof AuthError) {
        setError('root', { message: t('auth:errors.invalidCredentials') });
        return;
      }
      setError('root', { message: t('auth:errors.somethingWentWrong') });
    }
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex items-center font-syne text-4xl font-bold text-forest">
          FIT<span className="relative -top-2 align-top text-sm">®</span>
        </div>
        <h1 className="mb-2 font-syne text-4xl font-bold text-forest">{t('auth:login.heading')}</h1>
        <p className="text-sm font-medium text-forest/70">{t('auth:login.subtitle')}</p>
        <p className="mt-1 text-sm font-medium text-forest/70">
          {t('auth:login.noAccount')}{' '}
          <Link
            to={ROUTES.public.register}
            className="font-bold text-forest underline-offset-4 hover:underline"
          >
            {t('auth:login.signUp')}
          </Link>
        </p>
      </div>

      <div className="mb-6 w-full">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-full border-forest/20 bg-white font-bold text-forest hover:bg-forest/5"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          {t('auth:login.google')}
        </Button>
      </div>

      <div className="mb-6 flex w-full items-center gap-4">
        <div className="flex-1 border-t border-forest/10"></div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-forest/40">
          {t('auth:login.or')}
        </div>
        <div className="flex-1 border-t border-forest/10"></div>
      </div>

      <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-forest">
            {t('auth:login.email')}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
            placeholder={t('auth:login.emailPlaceholder')}
          />
          {errors.email ? (
            <p className="text-xs font-medium text-red-500">{t(errors.email.message ?? '')}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wider text-forest"
          >
            {t('auth:login.password')}
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
            placeholder="••••••••••••"
          />
          {errors.password ? (
            <p className="text-xs font-medium text-red-500">{t(errors.password.message ?? '')}</p>
          ) : null}
          {/* The backend has no password-reset endpoint yet; only the mock API serves it. */}
          {env.VITE_ENABLE_MSW ? (
            <div className="flex justify-end pt-1">
              <Link
                to={ROUTES.public.forgotPassword}
                className="text-xs font-medium text-forest/70 transition-colors hover:text-forest"
              >
                {t('auth:login.forgotPassword')}
              </Link>
            </div>
          ) : null}
        </div>

        {errors.root ? (
          <p className="mt-2 text-center text-xs font-medium text-red-500" role="alert">
            {errors.root.message}
          </p>
        ) : null}

        <Button
          type="submit"
          className="mt-4 h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90"
          disabled={isSubmitting || login.isPending}
        >
          {login.isPending ? t('auth:login.submitting') : t('auth:login.submit')}
        </Button>
      </form>
    </div>
  );
}
