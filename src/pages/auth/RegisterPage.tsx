import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { AuthLayout } from './components/AuthLayout';

import { useRegister } from '@/features/auth/model/useAuth';
import { ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

// Messages are i18n keys; they are translated where they are rendered.
const schema = z
  .object({
    email: z.string().email('auth:register.errors.email'),
    // Backend policy (RegisterRequestDto): 6-128 characters.
    password: z.string().min(6, 'auth:register.errors.min').max(128, 'auth:register.errors.max'),
    confirmPassword: z.string().min(1, 'auth:register.errors.confirmRequired'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth:register.errors.mismatch',
  });
type FormValues = z.infer<typeof schema>;

type Role = 'member' | 'pt' | 'gym_admin';
const ROLES: Role[] = ['member', 'pt', 'gym_admin'];

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useRegister();
  const [role, setRole] = useState<Role>('member');

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    document.title = `${t('auth:register.title')} — FIT AI`;
  }, [t]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      // The design collects no name yet, but the backend requires one.
      await register.mutateAsync({
        email: values.email,
        password: values.password,
        fullName: 'New User',
      });
      void navigate(ROUTES.member.profileSetup, { replace: true });
    } catch (error) {
      if (error instanceof ValidationError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if ((field === 'email' || field === 'password') && messages[0]) {
            setError(field, { message: messages[0] });
          }
        }
        if (error.message) setError('root', { message: error.message });
        return;
      }
      setError('root', { message: t('auth:errors.somethingWentWrong') });
    }
  });

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex items-center font-syne text-4xl font-bold text-forest">
            FIT<span className="relative -top-2 align-top text-sm">®</span>
          </div>
          <h1 className="mb-2 font-syne text-4xl font-bold text-forest">
            {t('auth:register.heading')}
          </h1>
          <p className="text-sm font-medium text-forest/70">{t('auth:register.subtitle')}</p>
        </div>

        <div className="mb-8 flex w-full flex-col gap-3" role="radiogroup">
          {ROLES.map((item) => {
            const selected = role === item;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRole(item)}
                className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${selected ? 'border-forest bg-forest/5' : 'border-forest/20 hover:border-forest/40'}`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-forest">
                    {t(`auth:register.roles.${item}.name`)}
                  </span>
                  <span className="text-xs text-forest/60">
                    {t(`auth:register.roles.${item}.desc`)}
                  </span>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-forest bg-forest' : 'border-forest/30'}`}
                >
                  {selected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-forest"
            >
              {t('auth:register.email')}
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...registerField('email')}
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
              {t('auth:register.password')}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...registerField('password')}
              className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
              placeholder={t('auth:register.passwordPlaceholder')}
            />
            {errors.password ? (
              <p className="text-xs font-medium text-red-500">{t(errors.password.message ?? '')}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-bold uppercase tracking-wider text-forest"
            >
              {t('auth:register.confirmPassword')}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...registerField('confirmPassword')}
              className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
              placeholder={t('auth:register.confirmPlaceholder')}
            />
            {errors.confirmPassword ? (
              <p className="text-xs font-medium text-red-500">
                {t(errors.confirmPassword.message ?? '')}
              </p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="mt-2 text-center text-xs font-medium text-red-500" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-6 h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90"
            disabled={register.isPending}
          >
            {t('auth:register.submit')}
          </Button>

          <div className="w-full pt-6 text-center">
            <p className="mb-6 text-[10px] font-medium text-forest/60">
              {t('auth:register.termsBefore')}{' '}
              <Link to="#" className="underline hover:text-forest">
                {t('auth:register.terms')}
              </Link>{' '}
              {t('auth:register.and')}{' '}
              <Link to="#" className="underline hover:text-forest">
                {t('auth:register.privacy')}
              </Link>{' '}
              {t('auth:register.termsAfter')}
            </p>
            <Link
              to={ROUTES.public.login}
              className="text-xs font-medium text-forest/60 transition-colors hover:text-forest"
            >
              {t('auth:register.haveAccount')}{' '}
              <span className="font-bold text-forest">{t('auth:register.signIn')}</span>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
