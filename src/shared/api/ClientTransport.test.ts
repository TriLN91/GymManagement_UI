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
