import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export function PTDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('portals.pt')}</CardTitle>
          <CardDescription>{t('dashboards:pt')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}