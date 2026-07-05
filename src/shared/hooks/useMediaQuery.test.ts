import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  let matches = false;

  beforeEach(() => {
    listeners.length = 0;
    matches = false;
    window.matchMedia = vi.fn().mockImplementation((q: string) => {
      const mql: MediaQueryList = {
        get matches() {
          return matches;
        },
        media: q,
        onchange: null,
        addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
          listeners.push(cb);
        },
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      } as unknown as MediaQueryList;
      return mql;
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the current match value from matchMedia', () => {
    matches = true;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('updates when matchMedia fires a change event', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);

    matches = true;
    act(() => {
      listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
    });
    expect(result.current).toBe(true);
  });
});
