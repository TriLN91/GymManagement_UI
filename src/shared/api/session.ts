import axios from 'axios';

import { ENDPOINTS } from '@/shared/api/endpoints';
import { NetworkError } from '@/shared/api/errorTypes';
import { STORAGE_KEYS } from '@/shared/config/constants';
import { env } from '@/shared/config/env';
import type { SessionUser as AuthUser } from '@/shared/config/roles';

const SNAPSHOT_KEY = 'gmc.session';
const EPOCH_KEY = 'gmc.sessionEpoch';
const CHANNEL = 'fitflex:session:v1';
type Snapshot = { id: string; revision: number; access: string; refresh: string; user: AuthUser };

/** Secrets remain in memory/sessionStorage. Same-origin tabs exchange live sessions,
 * never durable localStorage tokens. Web Locks serialize single-use refresh rotation. */
export class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;
  private id = '';
  private revision = 0;
  private version = 0;
  private channel: BroadcastChannel | null = null;
  private refreshFlight: Promise<string | null> | null = null;
  private sessionExpiredHandler: (() => void) | null = null;
  private sessionChangedHandler: ((user: AuthUser | null) => void) | null = null;
  private refreshIdentityHandler: ((dto: unknown) => AuthUser | null) | null = null;

  onSessionExpired(handler: () => void) {
    this.sessionExpiredHandler = handler;
  }
  onSessionChanged(handler: (user: AuthUser | null) => void) {
    this.sessionChangedHandler = handler;
  }
  onRefreshIdentity(handler: (dto: unknown) => AuthUser | null) {
    this.refreshIdentityHandler = handler;
  }
  notifySessionExpired() {
    this.sessionExpiredHandler?.();
  }
  getAccess() {
    return this.accessToken;
  }
  getRefresh() {
    return this.refreshToken;
  }
  getUser() {
    return this.user;
  }
  getVersion() {
    return this.version;
  }
  checkCurrent() {
    if (this.user && this.id && localStorage.getItem(EPOCH_KEY) !== this.id) this.drop();
  }

  hydrate() {
    try {
      const raw: unknown = JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) ?? 'null');
      if (this.isSnapshot(raw)) {
        if (localStorage.getItem(EPOCH_KEY) === raw.id) this.accept(raw);
        else this.drop();
        return;
      }
    } catch {
      /* Legacy sessions are migrated below. */
    }
    this.accessToken = sessionStorage.getItem(STORAGE_KEYS.accessToken);
    this.refreshToken = sessionStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  async connect(fallbackUser: AuthUser | null) {
    if (!this.channel && typeof window.BroadcastChannel === 'function') {
      this.channel = new window.BroadcastChannel(CHANNEL);
      this.channel.onmessage = (event: MessageEvent<unknown>) => {
        const message = event.data as { type?: string; snapshot?: unknown } | null;
        if (message?.type === 'request') this.broadcast();
        if (message?.type === 'session' && this.isSnapshot(message.snapshot)) {
          const snapshot = message.snapshot;
          if (
            localStorage.getItem(EPOCH_KEY) === snapshot.id &&
            (snapshot.id !== this.id || snapshot.revision >= this.revision)
          )
            this.accept(snapshot);
        }
        if (message?.type === 'logout' && this.id !== localStorage.getItem(EPOCH_KEY)) this.drop();
      };
      window.addEventListener('storage', (event) => {
        if (event.key !== EPOCH_KEY || event.newValue === this.id) return;
        this.drop();
        this.channel?.postMessage({ type: 'request' });
      });
    }
    // Migrate an existing tab session, but never pair account A's token with B's profile.
    if (this.accessToken && !this.user && fallbackUser && this.matchesUser(fallbackUser.id)) {
      this.user = fallbackUser;
      this.id = localStorage.getItem(EPOCH_KEY) ?? crypto.randomUUID();
      localStorage.setItem(EPOCH_KEY, this.id);
      this.persist();
    }
    await this.requestPeers();
  }

  private matchesUser(id: string) {
    try {
      const segment = this.accessToken!.split('.')[1];
      if (!segment) return env.VITE_ENABLE_MSW;
      const payload = JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/'))) as Record<
        string,
        unknown
      >;
      return (
        (payload.sub ??
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) === id
      );
    } catch {
      return false;
    }
  }

  private isSnapshot(value: unknown): value is Snapshot {
    if (!value || typeof value !== 'object') return false;
    const v = value as Partial<Snapshot>;
    return (
      typeof v.id === 'string' &&
      typeof v.revision === 'number' &&
      Number.isFinite(v.revision) &&
      typeof v.access === 'string' &&
      !!v.access &&
      typeof v.refresh === 'string' &&
      !!v.refresh &&
      !!v.user &&
      typeof v.user.id === 'string' &&
      Array.isArray(v.user.roles)
    );
  }

  private persist() {
    if (this.accessToken) sessionStorage.setItem(STORAGE_KEYS.accessToken, this.accessToken);
    if (this.refreshToken) sessionStorage.setItem(STORAGE_KEYS.refreshToken, this.refreshToken);
    if (this.user && this.accessToken && this.refreshToken) {
      sessionStorage.setItem(
        SNAPSHOT_KEY,
        JSON.stringify({
          id: this.id,
          revision: this.revision,
          access: this.accessToken,
          refresh: this.refreshToken,
          user: this.user,
        } satisfies Snapshot),
      );
    }
  }

  private accept(snapshot: Snapshot) {
    if (snapshot.id !== this.id) this.version++;
    this.id = snapshot.id;
    this.revision = snapshot.revision;
    this.accessToken = snapshot.access;
    this.refreshToken = snapshot.refresh;
    this.user = snapshot.user;
    this.persist();
    this.sessionChangedHandler?.(snapshot.user);
  }

  private broadcast() {
    if (
      this.user &&
      this.accessToken &&
      this.refreshToken &&
      localStorage.getItem(EPOCH_KEY) === this.id
    ) {
      this.channel?.postMessage({
        type: 'session',
        snapshot: {
          id: this.id,
          revision: this.revision,
          access: this.accessToken,
          refresh: this.refreshToken,
          user: this.user,
        } satisfies Snapshot,
      });
    }
  }

  private async requestPeers() {
    if (!this.channel) return;
    this.channel.postMessage({ type: 'request' });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
  }

  setTokens(access: string, refresh: string) {
    this.version++;
    this.id = crypto.randomUUID();
    this.revision = 0;
    this.user = null;
    sessionStorage.removeItem(SNAPSHOT_KEY);
    this.accessToken = access;
    this.refreshToken = refresh;
    this.persist();
  }

  publishIdentity(user: AuthUser) {
    this.user = user;
    if (!this.id) this.id = crypto.randomUUID();
    localStorage.setItem(EPOCH_KEY, this.id);
    this.persist();
    this.broadcast();
  }

  updateIdentity(user: AuthUser) {
    if (this.user?.id !== user.id) return;
    this.user = user;
    this.revision++;
    this.persist();
    this.broadcast();
  }

  private drop() {
    this.version++;
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.id = '';
    sessionStorage.removeItem(SNAPSHOT_KEY);
    sessionStorage.removeItem(STORAGE_KEYS.accessToken);
    sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
    sessionStorage.removeItem(STORAGE_KEYS.tenantId);
    this.sessionChangedHandler?.(null);
  }

  clear() {
    if (this.id && localStorage.getItem(EPOCH_KEY) === this.id) {
      localStorage.setItem(EPOCH_KEY, `signed-out:${crypto.randomUUID()}`);
      this.channel?.postMessage({ type: 'logout' });
    }
    this.drop();
  }

  async signOut(): Promise<void> {
    const accessToken = this.accessToken;
    const refreshToken = this.refreshToken;
    // Invalidate browser state before navigation/unload. Late revocation must
    // never clear a newer login, and revoking this family cannot affect it.
    this.clear();
    if (!accessToken || !refreshToken) return;
    const revoke = (access: string, refresh: string) =>
      axios.post(
        `${env.VITE_API_BASE_URL}${ENDPOINTS.auth.logout}`,
        { refreshToken: refresh },
        { headers: { Authorization: `Bearer ${access}` }, timeout: 20_000 },
      );
    try {
      await revoke(accessToken, refreshToken);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error;
      // Logout also works after access expiry. Rotate only the captured family;
      // never restore/broadcast its credentials into the signed-out browser.
      const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
        `${env.VITE_API_BASE_URL}${ENDPOINTS.auth.refresh}`,
        { accessToken, refreshToken },
        { timeout: 20_000 },
      );
      const tokens = response.data.data;
      await revoke(tokens.accessToken, tokens.refreshToken);
    }
  }

  async refresh(): Promise<string | null> {
    if (!this.refreshToken) return null;
    if (this.refreshFlight) {
      const access = this.accessToken;
      await this.refreshFlight;
      return this.accessToken === access && this.refreshToken ? this.refresh() : this.accessToken;
    }
    const version = this.version;
    const access = this.accessToken;
    const run = async (): Promise<string | null> => {
      if (this.channel) await this.requestPeers();
      if (version !== this.version) return null;
      if (access !== this.accessToken) return this.accessToken;
      const refresh = this.refreshToken;
      try {
        const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
          `${env.VITE_API_BASE_URL}${ENDPOINTS.auth.refresh}`,
          { accessToken: access ?? '', refreshToken: refresh },
          { timeout: 20_000 },
        );
        const tokens = response.data.data;
        if (!tokens?.accessToken || !tokens.refreshToken)
          throw new NetworkError('Invalid refresh response');
        if (version !== this.version || refresh !== this.refreshToken) return null;
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.user = this.refreshIdentityHandler?.(tokens) ?? this.user;
        this.revision++;
        this.persist();
        if (this.user) this.sessionChangedHandler?.(this.user);
        this.broadcast();
        return this.accessToken;
      } catch (error) {
        if (version !== this.version) return null;
        if (axios.isAxiosError(error) && [400, 401, 403].includes(error.response?.status ?? 0)) {
          this.clear();
          this.notifySessionExpired();
          return null;
        }
        // An outage is not revocation. Preserve the pair so the user can explicitly retry.
        throw new NetworkError('Không thể khôi phục phiên lúc này. Vui lòng thử lại.');
      }
    };
    // Unsupported browsers fail closed instead of replaying a single-use token across tabs.
    if (this.channel && !navigator.locks)
      throw new NetworkError('Trình duyệt không hỗ trợ đồng bộ phiên an toàn.');
    const flight = navigator.locks
      ? new Promise<string | null>((resolve, reject) => {
          void navigator.locks
            .request(`fitflex:refresh:${this.id}`, async () => {
              try {
                resolve(await run());
              } catch (error) {
                reject(
                  error instanceof Error ? error : new Error('Session synchronization failed'),
                );
              }
            })
            .catch(reject);
        })
      : run();
    this.refreshFlight = flight;
    try {
      return await flight;
    } finally {
      if (this.refreshFlight === flight) this.refreshFlight = null;
    }
  }
}
