import { describe, expect, it } from 'vitest';

import { statusLabelKey, statusVariant } from './statusPresentation';

describe('movement status presentation', () => {
  it('maps backend enums to business labels without changing the enum', () => {
    expect(statusLabelKey('CLEAR_ACCEPT')).toBe('status.accepted');
    expect(statusLabelKey('REQUIRES_REVIEW')).toBe('status.needsReview');
    expect(statusLabelKey('FAILED')).toBe('status.failed');
  });

  it('uses consistent semantic variants', () => {
    expect(statusVariant('ACTIVE')).toBe('accent');
    expect(statusVariant('EXCLUDE')).toBe('destructive');
    expect(statusVariant('AMBIGUOUS')).toBe('default');
  });
});
