import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthLayout } from './components/AuthLayout';

import { useResendEmailOtp, useVerifyEmailOtp } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ApiError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

const copy = {
  vi: {
    title: 'Xác minh email',
    description: 'Nhập mã xác minh đã được gửi đến',
    mandatory: 'Bắt buộc cho phiên đăng nhập Gym Owner',
    verify: 'Xác minh và tiếp tục',
    verifying: 'Đang xác minh',
    invalid: 'Mã xác minh không hợp lệ. Vui lòng kiểm tra và thử lại.',
    expired: 'Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới.',
    unavailable: 'Không thể xác minh lúc này. Vui lòng thử lại.',
    resend: 'Gửi lại mã',
    resending: 'Đang gửi lại',
    resendIn: 'Có thể gửi lại sau',
    resent: 'Mã mới đã được gửi đến email đăng ký.',
    attempts: 'Số lần thử còn lại do hệ thống xác thực quản lý',
    back: 'Quay lại đăng nhập',
    digit: 'Chữ số',
    of: 'trên',
  },
  en: {
    title: 'Verify your email',
    description: 'Enter the verification code sent to',
    mandatory: 'Required for every new Gym Owner session',
    verify: 'Verify and continue',
    verifying: 'Verifying',
    invalid: 'The verification code is invalid. Check it and try again.',
    expired: 'The verification code has expired. Request a new code.',
    unavailable: 'Verification is unavailable right now. Try again.',
    resend: 'Resend code',
    resending: 'Resending',
    resendIn: 'Resend available in',
    resent: 'A new code was sent to the registered email.',
    attempts: 'Remaining attempts are managed by the verification service',
    back: 'Back to sign in',
    digit: 'Digit',
    of: 'of',
  },
} as const;

export function EmailOtpVerificationPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const text = copy[isVi ? 'vi' : 'en'];
  const navigate = useNavigate();
  const challenge = useAuthStore((state) => state.pendingOtpChallenge);
  const setChallenge = useAuthStore((state) => state.setPendingOtpChallenge);
  const verify = useVerifyEmailOtp();
  const resend = useResendEmailOtp();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<ReadonlyArray<string>>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!challenge) return;
    setDigits(Array.from({ length: challenge.policy.codeLength }, () => ''));
    setError(null);
    setStatus(null);
    inputRefs.current[0]?.focus();
  }, [challenge]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const resendSeconds = useMemo(() => {
    if (!challenge) return 0;
    return Math.max(0, Math.ceil((Date.parse(challenge.policy.resendAvailableAt) - now) / 1000));
  }, [challenge, now]);
  const isExpired = challenge ? now >= Date.parse(challenge.policy.expiresAt) : false;

  if (!challenge) return <Navigate to={ROUTES.public.login} replace />;

  const updateDigit = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, '').slice(-1);
    setDigits((current) =>
      current.map((digit, position) => (position === index ? nextDigit : digit)),
    );
    setError(null);
    if (nextDigit && index < challenge.policy.codeLength - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (value: string) => {
    const pasted = value.replace(/\D/g, '').slice(0, challenge.policy.codeLength).split('');
    if (!pasted.length) return;
    setDigits(
      Array.from({ length: challenge.policy.codeLength }, (_, index) => pasted[index] ?? ''),
    );
    inputRefs.current[Math.min(pasted.length, challenge.policy.codeLength) - 1]?.focus();
  };

  const submit = async () => {
    const code = digits.join('');
    if (code.length !== challenge.policy.codeLength) {
      setError(text.invalid);
      return;
    }
    if (isExpired) {
      setError(text.expired);
      return;
    }
    try {
      const session = await verify.mutateAsync({ challengeId: challenge.challengeId, code });
      void navigate(
        session.user.roles.includes('gym_admin') ? ROUTES.admin.root : ROUTES.public.login,
        {
          replace: true,
        },
      );
    } catch (caught) {
      const codeValue = caught instanceof ApiError ? caught.code : undefined;
      setError(
        codeValue === 'OTP_EXPIRED'
          ? text.expired
          : codeValue === 'OTP_INVALID'
            ? text.invalid
            : text.unavailable,
      );
    }
  };

  const requestNewCode = async () => {
    if (resendSeconds > 0) return;
    try {
      await resend.mutateAsync({ challengeId: challenge.challengeId });
      setStatus(text.resent);
      setError(null);
    } catch {
      setError(text.unavailable);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full border border-border bg-white p-6 text-forest shadow-sm sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-energy-faint">
            <MailCheck aria-hidden="true" size={22} />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-pebble/50 bg-energy-faint px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em]">
            <ShieldCheck aria-hidden="true" size={13} />
            {text.mandatory}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold">{text.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {text.description} <strong className="text-forest">{challenge.maskedEmail}</strong>.
        </p>

        <div
          className="my-7 flex justify-center gap-2"
          onPaste={(event) => handlePaste(event.clipboardData.getData('text'))}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              aria-label={`${text.digit} ${index + 1} ${text.of} ${challenge.policy.codeLength}`}
              aria-invalid={Boolean(error)}
              className="h-12 min-w-0 flex-1 border border-border bg-background text-center font-data text-lg font-bold outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 aria-[invalid=true]:border-destructive"
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Backspace' && !digit && index > 0)
                  inputRefs.current[index - 1]?.focus();
              }}
            />
          ))}
        </div>

        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="mb-4 text-sm text-forest" role="status">
            {status}
          </p>
        ) : null}

        <Button
          className="w-full"
          type="button"
          disabled={verify.isPending || isExpired}
          onClick={() => void submit()}
        >
          {verify.isPending ? text.verifying : text.verify}
        </Button>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            {text.attempts}: {challenge.policy.attemptsRemaining}
          </span>
          <button
            type="button"
            className="font-bold text-forest disabled:cursor-not-allowed disabled:opacity-45"
            disabled={resend.isPending || resendSeconds > 0}
            onClick={() => void requestNewCode()}
          >
            {resend.isPending
              ? text.resending
              : resendSeconds > 0
                ? `${text.resendIn} ${resendSeconds}s`
                : text.resend}
          </button>
        </div>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-forest"
          onClick={() => {
            setChallenge(null);
            void navigate(ROUTES.public.login, { replace: true });
          }}
        >
          <ArrowLeft aria-hidden="true" size={14} />
          {text.back}
        </button>
      </div>
    </AuthLayout>
  );
}
