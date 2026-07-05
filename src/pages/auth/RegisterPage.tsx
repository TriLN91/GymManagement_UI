import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useRegister } from '@/features/auth/model/useAuth';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z.object({
  fullName: z.string().min(1, 'required'),
  email: z.string().email('invalid'),
  password: z.string().min(8, 'min8'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useRegister();

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  useEffect(() => {
    document.title = `${t('auth:register.title')} — AI Fitness Coaching`;
  }, [t]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register.mutateAsync(values);
      void navigate(ROUTES.member.root, { replace: true });
    } catch {
      setError('root', { message: t('auth:errors.somethingWentWrong') });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth:register.title')}</CardTitle>
          <CardDescription>{t('appName')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit();
            }}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('auth:register.fullName')}</Label>
              <Input id="fullName" autoComplete="name" {...registerField('fullName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth:register.email')}</Label>
              <Input id="email" type="email" autoComplete="email" {...registerField('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth:register.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...registerField('password')}
              />
            </div>
            {errors.root ? <p className="text-sm text-destructive">{errors.root.message}</p> : null}
            <Button type="submit" className="w-full" disabled={register.isPending}>
              {t('auth:register.submit')}
            </Button>
            <Link to={ROUTES.public.login} className="block text-sm text-primary hover:underline">
              {t('auth:register.haveAccount')}
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
