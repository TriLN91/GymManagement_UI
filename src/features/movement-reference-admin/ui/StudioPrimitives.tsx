import { AlertTriangle, CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/shared/api/errorTypes';

export function StudioStatus({ value }: { value: string }) {
  const { t } = useTranslation('movementStudio');
  return (
    <span className={`studio-status is-${value.toLowerCase()}`}>
      <span aria-hidden />
      {t(`status.${value}`, { defaultValue: value })}
    </span>
  );
}
export function StudioLoading() {
  const { t } = useTranslation('movementStudio');
  return (
    <div className="studio-empty" role="status">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      <p>{t('loading')}</p>
    </div>
  );
}
export function StudioError({ error }: { error: unknown }) {
  const { t } = useTranslation('movementStudio');
  if (!error) return null;
  const message = error instanceof Error ? error.message : '';
  const status = error instanceof ApiError ? error.status : 0;
  const key =
    /source image dimensions|source image|mixed legacy normalized geometry|Reference image dimensions/i.test(
      message,
    )
      ? 'geometry'
      : /recorded review, not live correction/i.test(message)
        ? 'reviewOnly'
        : /STUDIO_VIDEO_PREVIEW/.test(message)
          ? 'preview'
          : /already exists|duplicate/i.test(message)
            ? 'duplicate'
            : /classification changed/i.test(message)
              ? 'classification'
              : /visual.*evidence|video-aligned evidence/i.test(message)
                ? 'visual'
                : /concurrent/i.test(message)
                  ? 'concurrent'
                  : /canonical reference.*first/i.test(message)
                    ? 'reference'
                    : /review.*before publication/i.test(message)
                      ? 'approval'
                      : status === 403
                        ? 'forbidden'
                        : status === 404
                          ? 'missing'
                          : 'generic';
  return (
    <div className="studio-alert is-error" role="alert">
      <AlertTriangle aria-hidden className="h-5 w-5 shrink-0" />
      <div>
        <strong>{t(`errors.${key}`)}</strong>
        <details>
          <summary>{t('technicalDetails')}</summary>
          <p className="break-words text-xs">{message}</p>
        </details>
      </div>
    </div>
  );
}
export function StageCard({
  done,
  title,
  description,
  children,
}: {
  done: boolean;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="studio-stage">
      <span className={`studio-stage-icon ${done ? 'is-done' : ''}`}>
        {done ? <CheckCircle2 aria-hidden size={20} /> : <Clock3 aria-hidden size={20} />}
      </span>
      <div className="min-w-0 flex-1">
        <h3>{title}</h3>
        <p>{description}</p>
        {children}
      </div>
    </div>
  );
}
