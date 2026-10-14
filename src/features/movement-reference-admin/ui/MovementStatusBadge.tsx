import { useTranslation } from 'react-i18next';

import { statusLabelKey, statusVariant } from '../model/statusPresentation';

import { Badge } from '@/shared/ui/badge';

export function MovementStatusBadge({ value }: { value: string }) {
  const { t } = useTranslation('movementAdmin');
  return (
    <Badge variant={statusVariant(value)} title={value}>
      {t(statusLabelKey(value))}
    </Badge>
  );
}
