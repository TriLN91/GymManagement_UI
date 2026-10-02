import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/shared/ui/card';

export function SuperAdminDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Card className="portal-attention-card">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
