import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('merges tailwind classes and removes conflicts', () => {
    expect(cn('px-2', 'p-4')).toBe('p-4');
  });

  it('preserves non-conflicting classes', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold');
  });

  it('handles conditional values', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', 'extra')).toBe('base extra');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});
