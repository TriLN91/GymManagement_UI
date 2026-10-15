import {
  dayStatusClass,
  formatBusinessDate,
  isoWeekdayOf,
  nextTargetsByCode,
  sameWeekdays,
  targetPercent,
  toggleWeekday,
} from './presentation';

describe('progression presentation', () => {
  it('reads business dates as calendar dates without browser timezone shifts', () => {
    expect(isoWeekdayOf('2026-10-05')).toBe(1);
    expect(isoWeekdayOf('2026-10-11')).toBe(7);
    expect(formatBusinessDate('2026-10-05', 'en-GB')).toBe('05/10');
  });

  it('toggles weekdays in ISO order and compares sets regardless of order', () => {
    expect(toggleWeekday([5, 1], 3)).toEqual([1, 3, 5]);
    expect(toggleWeekday([1, 3, 5], 3)).toEqual([1, 5]);
    expect(sameWeekdays([5, 1, 3], [1, 3, 5])).toBe(true);
    expect(sameWeekdays([1, 3], [1, 3, 5])).toBe(false);
  });

  it('maps every scheduled day status to a style', () => {
    expect(dayStatusClass('Completed')).toBe('is-completed');
    expect(dayStatusClass('Paused')).toBe('is-paused');
  });

  it('caps target progress and keeps the nearest target per badge', () => {
    expect(targetPercent({ code: 'X', name: 'X', tier: 'A', threshold: 10, current: 25 })).toBe(
      100,
    );
    expect(targetPercent({ code: 'X', name: 'X', tier: 'A', threshold: 0, current: 5 })).toBe(0);
    const next = nextTargetsByCode([
      { code: 'WORKOUT_COUNT', name: 'W', tier: 'Silver', threshold: 50, current: 12 },
      { code: 'WORKOUT_COUNT', name: 'W', tier: 'Bronze', threshold: 20, current: 12 },
      { code: 'DISTANCE', name: 'D', tier: 'Bronze', threshold: 50, current: 3 },
    ]);
    expect(next.map((x) => `${x.code}:${x.threshold}`)).toEqual([
      'WORKOUT_COUNT:20',
      'DISTANCE:50',
    ]);
  });
});
