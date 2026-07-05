import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

import { ENDPOINTS } from '@/shared/api/endpoints';
import { ApiError, AuthError, NetworkError, ValidationError } from '@/shared/api/errorTypes';
import { STORAGE_KEYS } from '@/shared/config/constants';
import { env } from '@/shared/config/env';

// Browser-native UUIDv4 — no extra dep needed.
function generateUuid(): string {
  return crypto.randomUUID();
}

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);
type UnwrapEnvelope<T> = T extends { data: infer D } ? D : T;
type ApiEnvelope<T> = { data: T; meta?: Record<string, unknown> };

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshQueue: Array<(token: string | null) => void> = [];
  private isRefreshing = false;

  hydrate(): void {
    this.accessToken = sessionStorage.getItem(STORAGE_KEYS.accessToken);
    this.refreshToken = sessionStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    sessionStorage.setItem(STORAGE_KEYS.accessToken, access);
    sessionStorage.setItem(STORAGE_KEYS.refreshToken, refresh);
  }

  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.removeItem(STORAGE_KEYS.accessToken);
    sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
  }

  getAccess(): string | null {
    return this.accessToken;
  }

  getRefresh(): string | null {
    return this.refreshToken;
  }

  // FR-IAM-04: single-use rotation; concurrent 401s queue behind one refresh call.
  async refresh(): Promise<string | null> {
    if (!this.refreshToken) return null;

    if (this.isRefreshing) {
      return new Promise<string | null>((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.isRefreshing = true;
    try {
      const response = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
        `${env.VITE_API_BASE_URL}${ENDPOINTS.auth.refresh}`,
        { refreshToken: this.refreshToken },
      );
      const { accessToken, refreshToken } = response.data.data;
      this.setTokens(accessToken, refreshToken);
      this.flushQueue(accessToken);
      return accessToken;
    } catch {
      this.clear();
      this.flushQueue(null);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private flushQueue(token: string | null): void {
    while (this.refreshQueue.length > 0) {
      const next = this.refreshQueue.shift();
      if (next) next(token);
    }
  }
}

export const tokenManager = new TokenManager();

const instance: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: env.VITE_API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  const token = tokenManager.getAccess();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);

  const tenantId = sessionStorage.getItem(STORAGE_KEYS.tenantId);
  if (tenantId) config.headers.set('X-Tenant-Id', tenantId);

  // FR: idempotency for mutating requests — interceptor owns this, callers do not.
  if (config.method && MUTATING_METHODS.has(config.method.toLowerCase())) {
    if (!config.headers.has('Idempotency-Key')) {
      config.headers.set('Idempotency-Key', generateUuid());
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (!error.response) throw new NetworkError(error.message);

    const { status, data } = error.response;
    const message = (data as { message?: string } | undefined)?.message ?? error.message;
    const code = (data as { code?: string } | undefined)?.code;

    if (status === 401 && error.config && !(error.config as { _retried?: boolean })._retried) {
      const newToken = await tokenManager.refresh();
      if (newToken) {
        (error.config as { _retried?: boolean })._retried = true;
        error.config.headers.set('Authorization', `Bearer ${newToken}`);
        return instance.request(error.config);
      }
      throw new AuthError(status, message, code);
    }

    if (status === 422 || status === 400) {
      const fieldErrors =
        (data as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors ?? {};
      throw new ValidationError(status, message, fieldErrors, code);
    }

    throw new ApiError(status, message, code, data);
  },
);

function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data;
}

export async function apiGet<T>(
  url: string,
  config?: Parameters<AxiosInstance['get']>[1],
): Promise<T> {
  const res = await instance.get<ApiEnvelope<T>>(url, config);
  return unwrap(res);
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: Parameters<AxiosInstance['post']>[2],
): Promise<T> {
  const res = await instance.post<ApiEnvelope<T>>(url, body, config);
  return unwrap(res);
}

export async function apiPut<T, B = unknown>(
  url: string,
  body?: B,
  config?: Parameters<AxiosInstance['put']>[2],
): Promise<T> {
  const res = await instance.put<ApiEnvelope<T>>(url, body, config);
  return unwrap(res);
}

export async function apiPatch<T, B = unknown>(
  url: string,
  body?: B,
  config?: Parameters<AxiosInstance['patch']>[2],
): Promise<T> {
  const res = await instance.patch<ApiEnvelope<T>>(url, body, config);
  return unwrap(res);
}

export async function apiDelete<T>(
  url: string,
  config?: Parameters<AxiosInstance['delete']>[1],
): Promise<T> {
  const res = await instance.delete<ApiEnvelope<T>>(url, config);
  return unwrap(res);
}

export type { UnwrapEnvelope };
