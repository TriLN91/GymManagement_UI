import { analyticsPresetResources } from './mockData';

describe('Gym Owner analytics backend snapshots', () => {
  it('keeps KPI values and comparisons explicitly backend-owned', () => {
    const resource = analyticsPresetResources['30d'];
    expect(resource.state).toBe('loaded');
    if (resource.state !== 'loaded') return;

    expect(Object.values(resource.data.metrics).every((item) => item?.source === 'backend')).toBe(
      true,
    );
    expect(resource.data.metrics.sales).toMatchObject({
      currentValue: 194_400_000,
      previousValue: 172_800_000,
      absoluteDelta: 21_600_000,
      percentageDelta: 12.5,
    });
  });

  it('supports a partial backend response without fabricating the missing metric', () => {
    const resource = analyticsPresetResources['90d'];
    expect(resource.state).toBe('loaded');
    if (resource.state !== 'loaded') return;

    expect(resource.data.metrics.views).toBeUndefined();
    expect(resource.data.metrics.sales).toBeDefined();
  });
});
