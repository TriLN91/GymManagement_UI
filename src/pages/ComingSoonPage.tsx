import { useTranslation } from 'react-i18next';

export function ComingSoonPage() {
  const { t } = useTranslation('common');
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <p className="text-muted-foreground">{t('comingSoon')}</p>
    </div>
  );
}
