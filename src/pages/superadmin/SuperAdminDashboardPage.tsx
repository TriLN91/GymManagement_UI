import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export function SuperAdminDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('portals.superadmin')}</CardTitle>
          <CardDescription>{t('dashboards:superadmin')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
