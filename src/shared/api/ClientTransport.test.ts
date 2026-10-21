import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});
async function client(adapter: AxiosAdapter) {
  vi.resetModules();
  const create = axios.create.bind(axios);
  vi.spyOn(axios, 'create').mockImplementation((config) => {
    const instance = create(config);
    instance.defaults.adapter = adapter;
    return instance;
  });
  return import('./client');
}
it('does not coalesce mutations across accounts or tenants', async () => {
  const requests: InternalAxiosRequestConfig[] = [];
  const releases: Array<() => void> = [];
  const api = await client(
    (config) =>
      new Promise((resolve) => {
        requests.push(config);
        releases.push(() =>
          resolve({
            data: { data: config.headers.get('Authorization') },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          }),
        );
      }),
  );
  api.tokenManager.setTokens('a', 'refresh-a');
  sessionStorage.setItem('gmc.tenantId', 'tenant-a');
  const first = api.apiPost('/workouts/me/sessions', { clientRequestId: 'same' });
  await vi.waitFor(() => expect(requests).toHaveLength(1));
  api.tokenManager.setTokens('b', 'refresh-b');
  sessionStorage.setItem('gmc.tenantId', 'tenant-b');
  const second = api.apiPost('/workouts/me/sessions', { clientRequestId: 'same' });
  try {
    await vi.waitFor(() => expect(requests).toHaveLength(2));
  } finally {
    releases.forEach((release) => release());
    await Promise.allSettled([first, second]);
  }
  expect(requests.map((r) => r.headers.get('Authorization'))).toEqual(['Bearer a', 'Bearer b']);
});
it('honors independent idempotency keys and cancellation signals', async () => {
  const requests: InternalAxiosRequestConfig[] = [];
  const releases: Array<() => void> = [];
  const api = await client(
    (config) =>
      new Promise((resolve) => {
        requests.push(config);
        releases.push(() =>
          resolve({ data: { data: true }, status: 200, statusText: 'OK', headers: {}, config }),
        );
      }),
  );
  const first = api.apiPost(
    '/admin/reference-jobs',
    { name: 'same' },
    { signal: new AbortController().signal, headers: { 'Idempotency-Key': 'one' } },
  );
  const second = api.apiPost(
    '/admin/reference-jobs',
    { name: 'same' },
    { signal: new AbortController().signal, headers: { 'Idempotency-Key': 'two' } },
  );
  try {
    await vi.waitFor(() => expect(requests).toHaveLength(2));
  } finally {
    releases.forEach((release) => release());
    await Promise.allSettled([first, second]);
  }
  expect(requests.map((r) => r.headers.get('Idempotency-Key'))).toEqual(['one', 'two']);
});
it('refreshes a 401 only once and reuses the mutation idempotency key', async () => {
  const requests: InternalAxiosRequestConfig[] = [];
  const api = await client((config) => {
    requests.push(config);
    if (requests.length === 1)
      throw new AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined, {
        data: { message: 'Expired' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      });
    return Promise.resolve({
      data: { data: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  });
  api.tokenManager.setTokens('a', 'refresh-a');
  vi.spyOn(axios, 'post').mockResolvedValueOnce({
    data: { data: { accessToken: 'rotated', refreshToken: 'rotated-refresh' } },
  });
  await expect(api.apiPost('/workouts/me/sessions', {})).resolves.toBe(true);
  expect(requests).toHaveLength(2);
  expect(requests[0]!.headers.get('Idempotency-Key')).toBe(
    requests[1]!.headers.get('Idempotency-Key'),
  );
  expect(requests[1]!.timeout).toBe(20000);
});
it('keeps explicit video upload timeout and does not retry network failures', async () => {
  let captured: InternalAxiosRequestConfig | undefined;
  const adapter = vi.fn((config: InternalAxiosRequestConfig) => {
    captured = config;
    return Promise.reject(new AxiosError('timeout', 'ECONNABORTED', config));
  });
  const api = await client(adapter);
  await expect(
    api.apiPostForm('/admin/reference-jobs', new FormData(), { timeout: 330000 }),
  ).rejects.toThrow(/Timeout/);
  expect(captured?.timeout).toBe(330000);
  expect(adapter).toHaveBeenCalledOnce();
});

it('preserves the session on genuine 403 and never refreshes it', async () => {
  const api = await client((config) =>
    Promise.reject(
      new AxiosError('Forbidden', undefined, config, undefined, {
        data: { message: 'Forbidden' },
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config,
      }),
    ),
  );
  api.tokenManager.setTokens('member', 'refresh');
  const post = vi.spyOn(axios, 'post');
  const expired = vi.fn();
  api.tokenManager.onSessionExpired(expired);
  await expect(api.apiGet('/admin-only')).rejects.toMatchObject({ status: 403 });
  expect(api.tokenManager.getAccess()).toBe('member');
  expect(post).not.toHaveBeenCalled();
  expect(expired).not.toHaveBeenCalled();
});

it('retries a late 401 with the already rotated token instead of refreshing twice', async () => {
  let release!: () => void;
  let rotated = false;
  const api = await client((config) => {
    if (config.headers.get('Authorization') === 'Bearer rotated')
      return Promise.resolve({
        data: { data: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    const fail = () =>
      new AxiosError('Expired', undefined, config, undefined, {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      });
    if (config.url === '/late')
      return new Promise((_resolve, reject) => {
        release = () => reject(fail());
      });
    return Promise.reject(fail());
  });
  api.tokenManager.setTokens('old', 'refresh');
  const post = vi.spyOn(axios, 'post').mockImplementation(() => {
    rotated = true;
    return Promise.resolve({
      data: { data: { accessToken: 'rotated', refreshToken: 'rotated-refresh' } },
    });
  });
  const late = api.apiGet('/late');
  await vi.waitFor(() => expect(release).toBeDefined());
  await expect(api.apiGet('/first')).resolves.toBe(true);
  expect(rotated).toBe(true);
  release();
  await expect(late).resolves.toBe(true);
  expect(post).toHaveBeenCalledOnce();
});

it('stops after one refresh when the retried request is still unauthorized', async () => {
  const adapter = vi.fn((config: InternalAxiosRequestConfig) =>
    Promise.reject(
      new AxiosError('Expired', undefined, config, undefined, {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      }),
    ),
  );
  const api = await client(adapter);
  api.tokenManager.setTokens('old', 'refresh');
  const post = vi
    .spyOn(axios, 'post')
    .mockResolvedValue({ data: { data: { accessToken: 'new', refreshToken: 'new-refresh' } } });
  const expired = vi.fn();
  api.tokenManager.onSessionExpired(expired);
  await expect(api.apiGet('/protected')).rejects.toMatchObject({ status: 401 });
  expect(adapter).toHaveBeenCalledTimes(2);
  expect(post).toHaveBeenCalledOnce();
  expect(expired).toHaveBeenCalledOnce();
});
