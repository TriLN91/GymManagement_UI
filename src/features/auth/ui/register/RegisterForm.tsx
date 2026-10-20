import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useRegister, useRegisterGymAdmin } from '../../model/useAuth';

import { ApiError, ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

// Messages are i18n keys; they are translated where they are rendered.
// Trainer accounts are not self-registered: a Gym Admin creates them for their own gym.
type Role = 'member' | 'gym_admin';
const ROLES: Role[] = ['member', 'gym_admin'];

const baseFields = {
  email: z.string().email('auth:register.errors.email'),
  // Backend policy (RegisterRequestDto): 6-128 characters.
  password: z.string().min(6, 'auth:register.errors.min').max(128, 'auth:register.errors.max'),
  confirmPassword: z.string().min(1, 'auth:register.errors.confirmRequired'),
  fullName: z.string().max(200),
  gymName: z.string().max(200),
};

// Gym Admin additionally needs a contact name and the gym (organization) name.
function buildSchema(role: Role) {
  return z
    .object(baseFields)
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: 'auth:register.errors.mismatch',
    })
    .superRefine((values, ctx) => {
      if (role !== 'gym_admin') return;
      if (!values.fullName.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['fullName'],
          message: 'auth:register.errors.fullName',
        });
      }
      if (!values.gymName.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['gymName'],
          message: 'auth:register.errors.gymName',
        });
      }
    });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useRegister();
  const registerGymAdmin = useRegisterGymAdmin();
  const [role, setRole] = useState<Role>('member');
  const roleRef = useRef<Role>(role);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    // The schema depends on the selected role, so resolve it at submit time.
    resolver: (values, context, options) =>
      zodResolver(buildSchema(roleRef.current))(values, context, options),
    defaultValues: { email: '', password: '', confirmPassword: '', fullName: '', gymName: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (roleRef.current === 'gym_admin') {
        // No session is created: a Platform Admin must approve the account first.
        const pending = await registerGymAdmin.mutateAsync({
          email: values.email,
          password: values.password,
          fullName: values.fullName.trim(),
          gymName: values.gymName.trim(),
        });
        setPendingEmail(pending.email);
        return;
      }
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
          if (
            (field === 'email' ||
              field === 'password' ||
              field === 'fullName' ||
              field === 'gymName') &&
            messages[0]
          ) {
            setError(field, { message: messages[0] });
          }
        }
        if (error.message) setError('root', { message: error.message });
        return;
      }
      if (error instanceof ApiError && error.status === 409) {
        setError('root', { message: t('auth:register.errors.emailTaken') });
        return;
      }
      setError('root', { message: t('auth:errors.somethingWentWrong') });
    }
  });

  if (pendingEmail) {
    return (
      <>
        <div className="flex w-full flex-col items-center text-center" role="status">
          <h1 className="mb-3 font-syne text-3xl font-bold text-forest">
            {t('auth:register.pending.title')}
          </h1>
          <p className="mb-2 text-sm font-medium text-forest/80">
            {t('auth:register.pending.message', { email: pendingEmail })}
          </p>
          <p className="mb-8 text-xs text-forest/60">{t('auth:register.pending.hint')}</p>
          <Link
            to={ROUTES.public.login}
            className="text-sm font-bold text-forest underline hover:text-forest/80"
          >
            {t('auth:register.pending.backToLogin')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
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
                onClick={() => {
                  roleRef.current = item;
                  setRole(item);
                }}
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
          {role === 'gym_admin' ? (
            <>
              <p className="rounded-lg bg-forest/5 p-3 text-xs font-medium text-forest/80">
                {t('auth:register.gymAdminNote')}
              </p>
              <div className="space-y-1.5">
                <Label
                  htmlFor="fullName"
                  className="text-xs font-bold uppercase tracking-wider text-forest"
                >
                  {t('auth:register.fullName')}
                </Label>
                <Input
                  id="fullName"
                  autoComplete="name"
                  {...registerField('fullName')}
                  className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
                />
                {errors.fullName ? (
                  <p className="text-xs font-medium text-red-500">
                    {t(errors.fullName.message ?? '')}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="gymName"
                  className="text-xs font-bold uppercase tracking-wider text-forest"
                >
                  {t('auth:register.gymName')}
                </Label>
                <Input
                  id="gymName"
                  {...registerField('gymName')}
                  className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
                />
                {errors.gymName ? (
                  <p className="text-xs font-medium text-red-500">
                    {t(errors.gymName.message ?? '')}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
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
            disabled={register.isPending || registerGymAdmin.isPending}
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
    </>
  );
}
