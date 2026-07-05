import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useLogin } from '../model/useAuth';
import { useAuthStore } from '../model/useAuthStore';

import { AuthError, ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
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
  const hasRole = useAuthStore((s) => s.hasRole);

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
      const session = await login.mutateAsync(values);
      // FR-IAM-03: PT / Gym Admin require MFA (Phase 1 UI is a placeholder).
      if (hasRole(['pt', 'gym_admin'])) {
        // TODO(mfa): MFA flow for PT/GymAdmin (FR-IAM-03)
        // Phase 1 keeps the placeholder silent; the role check is enough to
        // gate future MFA redirects without leaking role info to the console.
      }
      void navigate(portalForRole(session.user.roles), { replace: true });
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('auth:login.title')}</CardTitle>
        <CardDescription>{t('auth:login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth:login.email')}</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth:login.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting || login.isPending}>
            {login.isPending ? t('auth:login.submitting') : t('auth:login.submit')}
          </Button>

          <div className="flex flex-col gap-2 text-sm">
            <Link to={ROUTES.public.forgotPassword} className="text-primary hover:underline">
              {t('auth:login.forgotPassword')}
            </Link>
            <Link to={ROUTES.public.register} className="text-primary hover:underline">
              {t('auth:login.signUp')}
            </Link>
          </div>

          {import.meta.env.DEV ? (
            <div className="mt-4 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
              <p className="font-semibold">{t('auth:login.devHint')}</p>
              <ul className="mt-1 space-y-0.5">
                <li>member@demo.gym / Password1!</li>
                <li>pt@demo.gym / Password1!</li>
                <li>admin@demo.gym / Password1!</li>
                <li>super@demo.gym / Password1!</li>
              </ul>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}