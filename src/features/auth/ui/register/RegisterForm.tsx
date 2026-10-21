import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { authApi } from '../../api/authApi';
import { useVerifyRegisterOtp } from '../../model/useAuth';

import type { RegisterPayload } from '@/entities/user';
import { ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

// Trainer accounts are not self-registered: a Gym Admin creates them for their own gym.
type Role = 'member' | 'gym_admin';
const ROLES: Role[] = ['member', 'gym_admin'];

const baseFields = {
  email: z.string().email('auth:register.errors.email'),
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

const backendRoleOf = (role: Role) => (role === 'gym_admin' ? 'GymAdmin' : 'Member');

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const verifyRegisterOtp = useVerifyRegisterOtp();

  const [role, setRole] = useState<Role>('member');
  const roleRef = useRef<Role>(role);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [savedValues, setSavedValues] = useState<FormValues | null>(null);

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

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isSubmittingRef = useRef(false);

  const toPayload = (values: FormValues, selected: Role): RegisterPayload => ({
    email: values.email,
    password: values.password,
    fullName:
      selected === 'gym_admin' ? values.fullName.trim() : values.email.split('@')[0] || 'User',
    role: backendRoleOf(selected),
    ...(selected === 'gym_admin' ? { gymName: values.gymName.trim() } : {}),
  });

  const onSendOtp = handleSubmit(async (values) => {
    if (isSubmittingRef.current || isSendingOtp) return;
    isSubmittingRef.current = true;
    setIsSendingOtp(true);
    setOtpError('');
    try {
      const res = await authApi.sendRegisterOtp(toPayload(values, roleRef.current));

      setSavedValues(values);
      if (res.debugOtpCode) {
        setDebugOtpCode(res.debugOtpCode);
      }
      setCooldown(60);
      setStep('otp');
      toast.success(res.message || t('auth:register.otp.sent'));
    } catch (error: unknown) {
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
      const message = error instanceof Error ? error.message : t('auth:errors.somethingWentWrong');
      setError('root', { message });
    } finally {
      isSubmittingRef.current = false;
      setIsSendingOtp(false);
    }
  });

  const onResendOtp = async () => {
    if (cooldown > 0 || !savedValues || isSubmittingRef.current || isSendingOtp) return;
    isSubmittingRef.current = true;
    setOtpError('');
    setIsSendingOtp(true);
    try {
      const res = await authApi.sendRegisterOtp(toPayload(savedValues, roleRef.current));
      if (res.debugOtpCode) {
        setDebugOtpCode(res.debugOtpCode);
      }
      setCooldown(60);
      toast.success(t('auth:register.otp.resent'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth:register.otp.resendFailed');
      setOtpError(message);
    } finally {
      isSubmittingRef.current = false;
      setIsSendingOtp(false);
    }
  };

  const onVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedValues || isSubmittingRef.current || verifyRegisterOtp.isPending) return;
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError(t('auth:register.otp.incomplete'));
      return;
    }

    isSubmittingRef.current = true;
    setOtpError('');
    try {
      const result = await verifyRegisterOtp.mutateAsync({
        email: savedValues.email,
        otpCode: otpCode.trim(),
      });

      if (result.status === 'pending') {
        // No session: a Platform Admin must approve the Gym Admin account first.
        setPendingEmail(result.email);
        return;
      }
      toast.success(t('auth:register.otp.success'));
      void navigate(ROUTES.member.profileSetup, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth:register.otp.invalid');
      setOtpError(message);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (pendingEmail) {
    return (
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
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center font-syne text-4xl font-bold text-forest">
          FIT<span className="relative -top-2 align-top text-sm">®</span>
        </div>
        <h1 className="mb-2 font-syne text-3xl font-bold text-forest sm:text-4xl">
          {step === 'form' ? t('auth:register.heading') : t('auth:register.otp.title')}
        </h1>
        <p className="max-w-sm text-sm font-medium text-forest/70">
          {step === 'form'
            ? t('auth:register.subtitle')
            : t('auth:register.otp.subtitle', { email: savedValues?.email })}
        </p>
      </div>

      {step === 'form' ? (
        <>
          {/* Role selector */}
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
                  className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                    selected
                      ? 'border-forest bg-forest/5'
                      : 'border-forest/20 hover:border-forest/40'
                  }`}
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
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-forest bg-forest' : 'border-forest/30'
                    }`}
                  >
                    {selected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={onSendOtp} className="w-full space-y-4" noValidate>
            {role === 'gym_admin' ? (
              <>
                {(
                  [
                    ['fullName', 'auth:register.fullName'],
                    ['gymName', 'auth:register.gymName'],
                  ] as const
                ).map(([name, label]) => (
                  <div key={name} className="space-y-1.5">
                    <Label
                      htmlFor={name}
                      className="text-xs font-bold uppercase tracking-wider text-forest"
                    >
                      {t(label)}
                    </Label>
                    <Input
                      id={name}
                      {...registerField(name)}
                      className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
                    />
                    {errors[name] ? (
                      <p className="text-xs font-medium text-red-500">
                        {t(errors[name]?.message ?? '')}
                      </p>
                    ) : null}
                  </div>
                ))}
                <p className="text-xs text-forest/60">{t('auth:register.gymAdminNote')}</p>
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
                <p className="text-xs font-medium text-red-500">
                  {t(errors.password.message ?? '')}
                </p>
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
              disabled={isSendingOtp}
            >
              {isSendingOtp ? t('auth:register.otp.sending') : t('auth:register.submit')}
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
        </>
      ) : (
        /* OTP Step */
        <div className="w-full space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-forest/20 bg-forest/5 p-3.5 text-xs text-forest">
            <span>
              {t('auth:register.otp.sentTo')} <strong>{savedValues?.email}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setOtpError('');
              }}
              className="flex items-center gap-1 text-xs font-semibold text-forest/70 underline hover:text-forest"
            >
              <ArrowLeft className="h-3 w-3" /> {t('auth:register.otp.edit')}
            </button>
          </div>

          {debugOtpCode && (
            <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <span>
                🛠️ {t('auth:register.otp.devCode')}{' '}
                <strong className="font-mono text-sm tracking-widest">{debugOtpCode}</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtpCode(debugOtpCode)}
                className="text-xs font-semibold text-amber-600 underline hover:text-amber-800 dark:text-amber-400"
              >
                {t('auth:register.otp.quickFill')}
              </button>
            </div>
          )}

          <form onSubmit={onVerifyOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-xs font-bold uppercase tracking-wider text-forest"
              >
                {t('auth:register.otp.label')}
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-forest/40" />
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(val);
                    setOtpError('');
                  }}
                  autoFocus
                  className="h-12 border-forest/20 bg-transparent pl-10 text-center font-mono text-xl font-bold tracking-[0.4em] text-forest focus-visible:ring-forest"
                />
              </div>
              <p className="text-[11px] text-forest/60">{t('auth:register.otp.hint')}</p>
            </div>

            {otpError && (
              <p className="text-center text-xs font-medium text-red-500" role="alert">
                {otpError}
              </p>
            )}

            <Button
              type="submit"
              disabled={verifyRegisterOtp.isPending || otpCode.length < 6}
              className="h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90"
            >
              {verifyRegisterOtp.isPending
                ? t('auth:register.otp.verifying')
                : t('auth:register.otp.verify')}
            </Button>

            <div className="flex items-center justify-between pt-3 text-xs text-forest/70">
              <span>{t('auth:register.otp.noCode')}</span>
              <button
                type="button"
                disabled={cooldown > 0 || isSendingOtp}
                onClick={onResendOtp}
                className="flex items-center gap-1 font-semibold text-forest hover:underline disabled:no-underline disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                {cooldown > 0
                  ? t('auth:register.otp.resendIn', { seconds: cooldown })
                  : t('auth:register.otp.resend')}
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs text-forest/60 transition-colors hover:text-forest"
              >
                &larr; {t('auth:register.otp.back')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
