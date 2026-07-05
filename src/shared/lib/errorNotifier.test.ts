import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearErrorDedup, notifyError } from './errorNotifier';

import { AuthError, NetworkError, ValidationError } from '@/shared/api/errorTypes';

vi.mock('@/shared/ui/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const { toast } = await import('@/shared/ui/toast');

describe('errorNotifier', () => {
  afterEach(() => {
    vi.mocked(toast.error).mockClear();
    clearErrorDedup();
  });

  it('toasts generic Error messages', () => {
    notifyError(new Error('boom'));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('boom');
  });

  it('falls back to a translated string for unknown values', () => {
    notifyError('weird failure');
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(expect.any(String));
  });

  it('dedupes repeat notifications of the same error', () => {
    notifyError(new Error('boom'));
    notifyError(new Error('boom'));
    notifyError(new Error('boom'));
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('uses translated copy for AuthError', () => {
    notifyError(new AuthError(401, 'expired', 'AUTH'));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(expect.any(String));
  });

  it('uses translated copy for ValidationError', () => {
    notifyError(new ValidationError(422, 'invalid', { email: ['required'] }, 'VAL'));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(expect.any(String));
  });

  it('uses translated copy for NetworkError', () => {
    notifyError(new NetworkError('offline'));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(expect.any(String));
  });

  it('clearErrorDedup resets the dedupe window', () => {
    notifyError(new Error('boom'));
    notifyError(new Error('boom'));
    expect(toast.error).toHaveBeenCalledTimes(1);
    clearErrorDedup();
    notifyError(new Error('boom'));
    expect(toast.error).toHaveBeenCalledTimes(2);
  });
});