import { createPeriodPair, validateCustomRange } from './dateRange';

describe('Gym Owner analytics date range', () => {
  it('uses inclusive dates and an immediately preceding period of equal duration', () => {
    expect(createPeriodPair('2026-09-01', '2026-09-15')).toEqual({
      currentPeriod: {
        startDate: '2026-09-01',
        endDate: '2026-09-15',
        timezone: 'Asia/Bangkok',
      },
      previousPeriod: {
        startDate: '2026-08-17',
        endDate: '2026-08-31',
        timezone: 'Asia/Bangkok',
      },
    });
  });

  it('rejects missing and reversed ranges', () => {
    expect(validateCustomRange('', '2026-09-15')).toEqual({ valid: false, reason: 'required' });
    expect(validateCustomRange('2026-09-16', '2026-09-15')).toEqual({
      valid: false,
      reason: 'order',
    });
  });
});
