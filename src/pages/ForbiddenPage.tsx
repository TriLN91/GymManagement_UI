import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function ForbiddenPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <h1 className="text-3xl font-bold">{t('page.forbiddenTitle', { ns: 'errors' })}</h1>
      <p className="text-muted-foreground">{t('page.forbiddenBody', { ns: 'errors' })}</p>
      <Button asChild>
        <Link to={ROUTES.member.root}>{t('page.goHome', { ns: 'errors' })}</Link>
      </Button>
    </div>
  );
}
