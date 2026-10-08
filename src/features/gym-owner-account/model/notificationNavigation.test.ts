import { isAllowedGymOwnerNotificationTarget } from './notificationNavigation';

describe('Gym Owner notification navigation', () => {
  it('allows only registered internal destinations', () => {
    expect(isAllowedGymOwnerNotificationTarget('/admin/orders/FIT-2026-1048')).toBe(true);
    expect(isAllowedGymOwnerNotificationTarget('https://example.com')).toBe(false);
    expect(isAllowedGymOwnerNotificationTarget('/admin/profile?token=secret')).toBe(false);
    expect(isAllowedGymOwnerNotificationTarget(null)).toBe(false);
  });
});
