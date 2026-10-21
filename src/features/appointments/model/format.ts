import { ApiError } from '@/shared/api/errorTypes';

export function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

/** `<input type="datetime-local">` value (browser local time) to the UTC instant the backend expects. */
export function localInputToUtcIso(value: string) {
  return new Date(value).toISOString();
}

/** Server message when the backend rejected the request, otherwise the translated fallback. */
export function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError && error.message ? error.message : fallback;
}
