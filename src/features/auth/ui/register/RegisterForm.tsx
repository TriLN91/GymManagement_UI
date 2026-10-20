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

import { ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z
  .object({
    email: z.string().email('auth:register.errors.email'),
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

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const verifyRegisterOtp = useVerifyRegisterOtp();

  const [role, setRole] = useState<Role>('member');
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
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
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

  const onSendOtp = handleSubmit(async (values) => {
    if (isSubmittingRef.current || isSendingOtp) return;
    isSubmittingRef.current = true;
    setIsSendingOtp(true);
    setOtpError('');
    try {
      const backendRole = role === 'gym_admin' ? 'GymAdmin' : role === 'pt' ? 'Trainer' : 'Member';
      const fullName = values.email.split('@')[0] || 'User';

      const res = await authApi.sendRegisterOtp({
        email: values.email,
        password: values.password,
        fullName,
        role: backendRole,
      });

      setSavedValues(values);
      if (res.debugOtpCode) {
        setDebugOtpCode(res.debugOtpCode);
      }
      setCooldown(60);
      setStep('otp');
      toast.success(res.message || 'Mã OTP đã được gửi đến email của bạn!');
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if ((field === 'email' || field === 'password') && messages[0]) {
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
      const backendRole = role === 'gym_admin' ? 'GymAdmin' : role === 'pt' ? 'Trainer' : 'Member';
      const res = await authApi.sendRegisterOtp({
        email: savedValues.email,
        password: savedValues.password,
        fullName: savedValues.email.split('@')[0] || 'User',
        role: backendRole,
      });
      if (res.debugOtpCode) {
        setDebugOtpCode(res.debugOtpCode);
      }
      setCooldown(60);
      toast.success('Mã OTP mới đã được gửi về email!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
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
      setOtpError('Vui lòng nhập đầy đủ mã OTP 6 số.');
      return;
    }

    isSubmittingRef.current = true;
    setOtpError('');
    try {
      await verifyRegisterOtp.mutateAsync({
        email: savedValues.email,
        otpCode: otpCode.trim(),
      });

      toast.success('Đăng ký tài khoản thành công!');

      if (role === 'gym_admin') {
        void navigate(ROUTES.admin.onboarding, { replace: true });
      } else if (role === 'pt') {
        void navigate(ROUTES.pt.root, { replace: true });
      } else {
        void navigate(ROUTES.member.profileSetup, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Mã OTP không chính xác hoặc đã hết hạn.';
      setOtpError(message);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center font-syne text-4xl font-bold text-forest">
          FIT<span className="relative -top-2 align-top text-sm">®</span>
        </div>
        <h1 className="mb-2 font-syne text-3xl sm:text-4xl font-bold text-forest">
          {step === 'form' ? t('auth:register.heading') : 'Xác thực mã OTP'}
        </h1>
        <p className="text-sm font-medium text-forest/70 max-w-sm">
          {step === 'form'
            ? t('auth:register.subtitle')
            : `Hệ thống đã gửi mã OTP 6 số về email ${savedValues?.email}. Vui lòng nhập mã để hoàn tất đăng ký.`}
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
                  onClick={() => setRole(item)}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                    selected ? 'border-forest bg-forest/5' : 'border-forest/20 hover:border-forest/40'
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
              disabled={isSendingOtp}
            >
              {isSendingOtp ? 'Đang gửi mã xác thực...' : t('auth:register.submit')}
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
          <div className="p-3.5 rounded-xl bg-forest/5 border border-forest/20 flex items-center justify-between text-xs text-forest">
            <span>
              Gửi tới: <strong>{savedValues?.email}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setOtpError('');
              }}
              className="text-xs text-forest/70 hover:text-forest underline flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3 h-3" /> Đổi thông tin
            </button>
          </div>

          {debugOtpCode && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
              <span>
                🛠️ Mã OTP phát triển: <strong className="font-mono text-sm tracking-widest">{debugOtpCode}</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtpCode(debugOtpCode)}
                className="text-xs underline font-semibold text-amber-600 hover:text-amber-800 dark:text-amber-400"
              >
                Nhập nhanh
              </button>
            </div>
          )}

          <form onSubmit={onVerifyOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-forest">
                Mã xác thực OTP (6 chữ số)
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
                  className="pl-10 h-12 text-center text-xl font-bold tracking-[0.4em] font-mono border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
                />
              </div>
              <p className="text-[11px] text-forest/60">
                Mã OTP có hiệu lực trong 15 phút. Nhập sai quá 5 lần sẽ bị hủy mã.
              </p>
            </div>

            {otpError && (
              <p className="text-xs font-medium text-red-500 text-center" role="alert">
                {otpError}
              </p>
            )}

            <Button
              type="submit"
              disabled={verifyRegisterOtp.isPending || otpCode.length < 6}
              className="h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90"
            >
              {verifyRegisterOtp.isPending ? 'Đang xác thực...' : 'Xác thực & Hoàn tất đăng ký'}
            </Button>

            <div className="flex items-center justify-between pt-3 text-xs text-forest/70">
              <span>Chưa nhận được mã?</span>
              <button
                type="button"
                disabled={cooldown > 0 || isSendingOtp}
                onClick={onResendOtp}
                className="flex items-center gap-1 font-semibold text-forest hover:underline disabled:opacity-50 disabled:no-underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã OTP'}
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs text-forest/60 hover:text-forest transition-colors"
              >
                &larr; Quay lại chỉnh sửa thông tin đăng ký
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
