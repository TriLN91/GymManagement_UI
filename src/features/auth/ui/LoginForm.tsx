import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useLogin } from '../model/useAuth';

import { AuthError, ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z.object({
  email: z.string().email('auth:errors.invalidCredentials'),
  password: z.string().min(1, 'auth:errors.invalidCredentials'),
});

type FormValues = z.infer<typeof schema>;

const portalForRole = (roles: ReadonlyArray<string>): string => {
  if (roles.includes('super_admin')) return ROUTES.superadmin.root;
  if (roles.includes('gym_admin')) return ROUTES.admin.root;
  if (roles.includes('pt')) return ROUTES.pt.root;
  return ROUTES.member.root;
};

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  useEffect(() => {
    // If already authenticated, push to portal — but only after the mutation completes.
    // Here we just guard against double-mounted forms; routing guards handle the rest.
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await login.mutateAsync(values);
      if ('challengeId' in response) {
        void navigate(ROUTES.public.verifyEmailOtp, { replace: true });
        return;
      }
      void navigate(portalForRole(response.user.roles), { replace: true });
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
        <h1 className="mb-2 font-syne text-4xl font-bold text-forest">Đăng Nhập.</h1>
        <p className="text-sm font-medium text-forest/70">Tiếp tục hành trình tập luyện của bạn.</p>
        <p className="mt-1 text-sm font-medium text-forest/70">
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.public.register} className="font-bold text-forest hover:text-mint">
            Đăng ký
          </Link>
        </p>
      </div>

      <div className="mb-6 flex w-full gap-4">
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-full border-forest/20 bg-white font-bold text-forest hover:bg-forest/5"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-full border-forest/20 bg-white font-bold text-forest hover:bg-forest/5"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.205 14.86c-.463.228-1.07.394-1.638.394-1.996 0-3.355-1.282-3.355-3.308 0-2.096 1.452-3.355 3.32-3.355.503 0 1.05.118 1.465.308l-.34 1.293c-.347-.142-.82-.245-1.246-.245-1.127 0-1.892.71-1.892 2.05 0 1.254.717 1.963 1.884 1.963.48 0 .977-.126 1.372-.284l.43 1.184z" />
          </svg>
          Apple
        </Button>
      </div>

      <div className="mb-6 flex w-full items-center gap-4">
        <div className="flex-1 border-t border-forest/10"></div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-forest/40">Hoặc</div>
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
            placeholder="email@gmail.com"
          />
          {errors.email ? (
            <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-forest"
            >
              {t('auth:login.password')}
            </Label>
            <Link
              to={ROUTES.public.forgotPassword}
              className="text-xs text-forest/60 transition-colors hover:text-forest"
            >
              {t('auth:login.forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
            placeholder="••••••••••••"
          />
          {errors.password ? (
            <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
          ) : null}
        </div>

        {errors.root ? (
          <p className="mt-2 text-center text-xs font-medium text-red-500" role="alert">
            {errors.root.message}
          </p>
        ) : null}

        <Button
          type="submit"
          className="hover:bg-mint/90 mt-4 h-12 w-full rounded-full bg-mint font-bold text-forest"
          disabled={isSubmitting || login.isPending}
        >
          {login.isPending ? t('auth:login.submitting') : 'Đăng Nhập \u2192'}
        </Button>

        <div className="w-full pt-8 text-center">
          <Link
            to={ROUTES.admin.root}
            className="flex items-center justify-center gap-2 text-xs font-medium text-forest/60 transition-colors hover:text-forest"
          >
            Đăng nhập quyền Admin <span className="font-bold">&rarr;</span>
          </Link>
        </div>

        {import.meta.env.DEV ? (
          <div className="mt-8 rounded-xl border border-dashed border-forest/20 bg-white/50 p-4 text-xs text-forest/60">
            <p className="mb-2 font-bold uppercase tracking-wider text-forest">
              {t('auth:login.devHint')}
            </p>
            <ul className="space-y-1 font-medium">
              <li>member@demo.gym / Password1!</li>
              <li>pt@demo.gym / Password1!</li>
              <li>admin@demo.gym / Password1!</li>
              <li>super@demo.gym / Password1!</li>
            </ul>
          </div>
        ) : null}
      </form>
    </div>
  );
}
