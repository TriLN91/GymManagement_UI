import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { authApi } from '@/features/auth/api/authApi';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z.object({ password: z.string().min(8, 'min8') });
type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    document.title = `${t('auth:reset.title')} — AI Fitness Coaching`;
  }, [t]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setError('root', { message: t('auth:errors.somethingWentWrong') });
      return;
    }
    try {
      await authApi.resetPassword(token, values.password);
      setDone(true);
    } catch {
      setError('root', { message: t('auth:errors.somethingWentWrong') });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth:reset.title')}</CardTitle>
          <CardDescription>{t('appName')}</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="text-sm text-foreground">{t('auth:reset.success')}</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth:reset.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                ) : null}
              </div>
              {errors.root ? (
                <p className="text-sm text-destructive">{errors.root.message}</p>
              ) : null}
              <Button type="submit" className="w-full">
                {t('auth:reset.submit')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
