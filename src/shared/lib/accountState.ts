import { createJSONStorage } from 'zustand/middleware';

const LEGACY_OWNER = 'fitflex:legacy-state-owner';
const resets = new Set<() => void>();
let resetting = false;
let resetOwner: string | null = null;

function owner(): string | null {
  if (resetting) return resetOwner;
  try {
    const session = JSON.parse(sessionStorage.getItem('gmc.session') ?? 'null') as {
      user?: { id?: string };
    } | null;
    const auth = JSON.parse(localStorage.getItem('app:auth') ?? 'null') as {
      state?: { user?: { id?: string } };
    } | null;
    return session?.user?.id ?? auth?.state?.user?.id ?? null;
  } catch {
    return null;
  }
}

// Keep unsynced drafts for their owner; never load them into the next account.
export const accountStorage = createJSONStorage(() => ({
  getItem(name: string) {
    const id = owner();
    if (!id) return null;
    const saved = localStorage.getItem(`${name}:account:${id}`);
    if (saved !== null) return saved;
    const legacyOwner = localStorage.getItem(LEGACY_OWNER);
    return legacyOwner === id ? localStorage.getItem(name) : null;
  },
  setItem(name: string, value: string) {
    const id = owner();
    if (id && !resetting) localStorage.setItem(`${name}:account:${id}`, value);
  },
  removeItem(name: string) {
    const id = owner();
    if (id) localStorage.removeItem(`${name}:account:${id}`);
  },
}));

export function bindLegacyState(id: string | undefined) {
  if (id && !localStorage.getItem(LEGACY_OWNER)) localStorage.setItem(LEGACY_OWNER, id);
}

export function registerAccountStore<T extends object>(store: {
  getInitialState: () => T;
  setState: (state: T) => void;
  persist?: { rehydrate: () => void | Promise<void> };
}) {
  resets.add(() => {
    store.setState(store.getInitialState());
    void store.persist?.rehydrate();
  });
}

export function resetAccountStores(id: string | null) {
  resetOwner = id;
  resetting = true;
  try {
    resets.forEach((reset) => reset());
  } finally {
    resetting = false;
  }
}
