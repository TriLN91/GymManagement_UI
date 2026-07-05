import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the latest value after the delay elapses', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'a', delay: 200 },
    });
    expect(result.current).toBe('a');

    rerender({ value: 'b', delay: 200 });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });

  it('cleans up the timer on unmount (no late state updates)', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'x' },
    });
    rerender({ value: 'y' });
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // The last value before unmount should still be 'x'.
    expect(result.current).toBe('x');
  });
});
