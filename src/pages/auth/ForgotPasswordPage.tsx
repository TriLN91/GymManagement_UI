import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { authApi } from '@/features/auth/api/authApi';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';


const schema = z.object({ email: z.string().email('invalid') });
type FormValues = z.infer<typeof schema>;

// FR-IAM-06 AC4: identical response for existing and non-existing emails — prevent enumeration.
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    document.title = `${t('auth:forgot.title')} — AI Fitness Coaching`;
  }, [t]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.forgotPassword(values.email);
    } finally {
      setSubmitted(true);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth:forgot.title')}</CardTitle>
          <CardDescription>{t('auth:forgot.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-foreground">{t('auth:forgot.success')}</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth:forgot.email')}</Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {t('auth:forgot.submit')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}