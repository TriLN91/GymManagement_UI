import axios, { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenManager } from './session';

describe('session rotation', () => {
  let session: TokenManager;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    session = new TokenManager();
    session.setTokens('access', 'refresh');
  });
  afterEach(() => vi.restoreAllMocks());

  it('shares one refresh flight across concurrent callers', async () => {
    const post = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { data: { accessToken: 'new', refreshToken: 'rotated' } } });
    expect(await Promise.all([session.refresh(), session.refresh(), session.refresh()])).toEqual([
      'new',
      'new',
      'new',
    ]);
    expect(post).toHaveBeenCalledOnce();
    expect(session.getRefresh()).toBe('rotated');
  });

  it('preserves credentials on a temporary network failure', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new AxiosError('offline', 'ERR_NETWORK'));
    const expired = vi.fn();
    session.onSessionExpired(expired);
    await expect(session.refresh()).rejects.toThrow('khôi phục');
    expect(session.getRefresh()).toBe('refresh');
    expect(expired).not.toHaveBeenCalled();
  });

  it('clears a rejected refresh and notifies the app', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(
      new AxiosError('revoked', undefined, undefined, undefined, { status: 401 } as never),
    );
    const expired = vi.fn();
    session.onSessionExpired(expired);
    await expect(session.refresh()).resolves.toBeNull();
    expect(session.getAccess()).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
  });

  it('does not let an old refresh replace a new login', async () => {
    let release!: (value: unknown) => void;
    vi.spyOn(axios, 'post').mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const old = session.refresh();
    await vi.waitFor(() => expect(release).toBeDefined());
    session.setTokens('account-b', 'refresh-b');
    release({ data: { data: { accessToken: 'old-rotated', refreshToken: 'old-refresh' } } });
    await expect(old).resolves.toBeNull();
    expect(session.getAccess()).toBe('account-b');
  });

  it('restores its own atomic identity on reload and keeps secrets out of localStorage', () => {
    const user = { id: 'a', fullName: 'A', email: 'a@example.com', roles: ['member'] as const };
    session.publishIdentity({ ...user, roles: ['member'] });
    const restored = new TokenManager();
    restored.hydrate();
    expect(restored.getUser()?.id).toBe('a');
    expect(restored.getAccess()).toBe('access');
    expect(JSON.stringify(localStorage)).not.toContain('refresh');
    expect(JSON.stringify(localStorage)).not.toContain('access');
  });

  it('rejects a copied tab snapshot invalidated by logout', () => {
    session.publishIdentity({ id: 'a', fullName: 'A', email: 'a@example.com', roles: ['member'] });
    localStorage.setItem('gmc.sessionEpoch', 'signed-out:elsewhere');
    const restored = new TokenManager();
    restored.hydrate();
    expect(restored.getAccess()).toBeNull();
  });

  it('keeps an updated profile in the atomic reload snapshot', () => {
    session.publishIdentity({
      id: 'a',
      fullName: 'Before',
      email: 'a@example.com',
      roles: ['member'],
    });
    session.updateIdentity({
      id: 'a',
      fullName: 'After',
      email: 'a@example.com',
      roles: ['member'],
    });
    const restored = new TokenManager();
    restored.hydrate();
    expect(restored.getUser()?.fullName).toBe('After');
  });

  it('signs out locally before revocation completes without clearing a later login', async () => {
    let finish!: (value: unknown) => void;
    vi.spyOn(axios, 'post').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const revocation = session.signOut();
    expect(session.getAccess()).toBeNull();
    expect(sessionStorage.getItem('gmc.accessToken')).toBeNull();
    session.setTokens('new-login', 'new-refresh');
    finish({});
    await revocation;
    expect(session.getAccess()).toBe('new-login');
  });

  it('revokes an expired access session through refresh without restoring it', async () => {
    const post = vi
      .spyOn(axios, 'post')
      .mockRejectedValueOnce(
        new AxiosError('Expired', undefined, undefined, undefined, { status: 401 } as never),
      )
      .mockResolvedValueOnce({
        data: { data: { accessToken: 'rotated', refreshToken: 'rotated-refresh' } },
      })
      .mockResolvedValueOnce({});
    await session.signOut();
    expect(post).toHaveBeenCalledTimes(3);
    expect(session.getAccess()).toBeNull();
    expect(sessionStorage.getItem('gmc.refreshToken')).toBeNull();
  });
});
