import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { processingIssueCode } from '../model/processingEvidence';

import { ApiError } from '@/shared/api/errorTypes';

export function ApiErrorNotice({ error }: { error: unknown }) {
  const { t } = useTranslation('movementAdmin');
  if (!error) return null;
  const apiError = error instanceof ApiError ? error : null;
  const title =
    apiError?.status === 403
      ? t('errors.forbidden')
      : apiError?.status === 404
        ? t('errors.notFound')
        : apiError?.status === 409
          ? t('errors.conflict')
          : apiError?.status === 400 || apiError?.status === 422
            ? t('errors.invalid')
            : t('errors.generic');
  const message = error instanceof Error ? error.message : t('errors.generic');
  const issue = processingIssueCode(apiError?.code, message);
  const hasExplanation =
    Boolean(apiError?.code || /Traceback|Exception|exit code/i.test(message)) &&
    t(`processingIssues.${issue}.title`, { defaultValue: '' }) !== '';
  return (
    <div
      className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        <strong className="block">
          {hasExplanation ? t(`processingIssues.${issue}.title`) : title}
        </strong>
        <span>
          {hasExplanation
            ? t(`processingIssues.${issue}.description`)
            : /Traceback|Exception|exit code/i.test(message)
              ? t('errors.generic')
              : message}
        </span>
        {hasExplanation ? (
          <p className="mt-2 font-medium">{t(`processingIssues.${issue}.recovery`)}</p>
        ) : null}
        <details className="mt-2">
          <summary className="cursor-pointer">{t('workspace.technicalAudit')}</summary>
          {apiError?.code ? <code className="mt-1 block text-xs">{apiError.code}</code> : null}
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">
            {message}
          </pre>
        </details>
      </div>
    </div>
  );
}
