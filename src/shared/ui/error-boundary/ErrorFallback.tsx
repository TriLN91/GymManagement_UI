import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const { t } = useTranslation('errors');
  return (
    <div role="alert" className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle as="h2">{t('boundary.title')}</CardTitle>
          <CardDescription>{t('boundary.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error.message}
          </p>
          <Button type="button" onClick={reset}>
            {t('boundary.retry')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}