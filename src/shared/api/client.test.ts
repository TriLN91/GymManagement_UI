import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { extractFieldErrors, tokenManager, unwrapApiResponse } from './client';

describe('unwrapApiResponse', () => {
  it('supports both established envelopes and raw backend DTOs', () => {
    expect(unwrapApiResponse({ isSuccess: true, message: 'ok', data: { id: '1' } })).toEqual({
      id: '1',
    });
    expect(unwrapApiResponse({ id: '2', name: 'Squat' })).toEqual({ id: '2', name: 'Squat' });
  });
});

describe('extractFieldErrors', () => {
  it('prefers explicit fieldErrors from the response body', () => {
    expect(extractFieldErrors({ fieldErrors: { email: ['bad'] } }, undefined, 'x')).toEqual({
      email: ['bad'],
    });
  });

  it('parses the backend Validation message into camelCase fields', () => {
    const message =
      '400: Validation Error thất bại - Password: Mật khẩu quá ngắn | FullName: Bắt buộc';
    expect(extractFieldErrors({}, 'Validation', message)).toEqual({
      password: ['Mật khẩu quá ngắn'],
      fullName: ['Bắt buộc'],
    });
  });

  it('returns nothing for non-validation errors', () => {
    expect(extractFieldErrors({}, 'DuplicateConflict', '409: x - a: b')).toEqual({});
  });
});

describe('tokenManager', () => {
  beforeEach(() => {
    sessionStorage.clear();
    tokenManager.clear();
    vi.restoreAllMocks();
  });

  it('refresh sends the access and refresh tokens and stores the rotated pair', async () => {
    tokenManager.setTokens('old-access', 'old-refresh');
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } },
    });

    await expect(tokenManager.refresh()).resolves.toBe('new-access');

    expect(post.mock.calls[0]?.[0]).toMatch(/\/identity\/refresh$/);
    expect(post.mock.calls[0]?.[1]).toEqual({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
    });
    expect(tokenManager.getAccess()).toBe('new-access');
    expect(tokenManager.getRefresh()).toBe('new-refresh');
  });

  it('refresh clears tokens and returns null when the backend rejects it', async () => {
    tokenManager.setTokens('old-access', 'old-refresh');
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('401'));

    await expect(tokenManager.refresh()).resolves.toBeNull();
    expect(tokenManager.getAccess()).toBeNull();
    expect(sessionStorage.getItem('gmc.refreshToken')).toBeNull();
  });

  it('refresh returns null without a network call when there is no refresh token', async () => {
    const post = vi.spyOn(axios, 'post');
    await expect(tokenManager.refresh()).resolves.toBeNull();
    expect(post).not.toHaveBeenCalled();
  });

  it('notifySessionExpired calls the registered handler', () => {
    const handler = vi.fn();
    tokenManager.onSessionExpired(handler);
    tokenManager.notifySessionExpired();
    expect(handler).toHaveBeenCalledOnce();
  });
});
