import i18n from '@/i18n';
import { AuthError, NetworkError, ValidationError } from '@/shared/api/errorTypes';
import { toast } from '@/shared/ui/toast';

const SEEN_TOASTS = new Set<string>();

function shortId(input: unknown): string {
  if (input instanceof Error) return `${input.name}:${input.message}`;
  return String(input);
}

function humanize(error: unknown): string {
  if (error instanceof AuthError) return i18n.t('errors:auth.invalidSession');
  if (error instanceof ValidationError) return i18n.t('errors:validation.failed');
  if (error instanceof NetworkError) return i18n.t('errors:network.offline');
  if (error instanceof Error) return error.message;
  return i18n.t('errors:generic.unknown');
}

export function notifyError(error: unknown): void {
  const key = shortId(error);
  // De-dupe so retry loops don't spam the toast tray.
  if (SEEN_TOASTS.has(key)) return;
  SEEN_TOASTS.add(key);
  toast.error(humanize(error));
  // Free the dedupe slot after a short window so a *later* failure is shown.
  setTimeout(() => SEEN_TOASTS.delete(key), 5_000);
}

export function clearErrorDedup(): void {
  SEEN_TOASTS.clear();
}
