import type { BackendAnalyticsMetric } from '../model/types';

import type { GymOwnerAnalyticsCopy } from './copy';

interface AnalyticsTrendChartProps {
  metric: BackendAnalyticsMetric;
  copy: GymOwnerAnalyticsCopy;
  formatValue: (value: number) => string;
}

const WIDTH = 760;
const HEIGHT = 250;
const PADDING = 26;

function points(values: ReadonlyArray<number>, max: number) {
  const chartWidth = WIDTH - PADDING * 2;
  const chartHeight = HEIGHT - PADDING * 2;
  return values
    .map((value, index) => {
      const divisor = Math.max(values.length - 1, 1);
      const x = PADDING + (index / divisor) * chartWidth;
      const y = HEIGHT - PADDING - (value / max) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

export function AnalyticsTrendChart({ metric, copy, formatValue }: AnalyticsTrendChartProps) {
  const currentValues = metric.currentSeries.map((point) => point.value);
  const previousValues = metric.previousSeries.map((point) => point.value);
  const max = Math.max(...currentValues, ...previousValues, 1);
  const accessibleSummary = `${copy.currentSeries}: ${currentValues.map(formatValue).join(', ')}. ${copy.previousSeries}: ${previousValues.map(formatValue).join(', ')}.`;

  return (
    <div className="gym-analytics-chart">
      <div className="gym-analytics-chart__legend" aria-hidden="true">
        <span>
          <i className="is-current" />
          {copy.currentSeries}
        </span>
        <span>
          <i className="is-previous" />
          {copy.previousSeries}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={accessibleSummary}
        preserveAspectRatio="none"
      >
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={HEIGHT * ratio}
            y2={HEIGHT * ratio}
            className="gym-analytics-chart__grid"
          />
        ))}
        <polyline points={points(previousValues, max)} className="gym-analytics-chart__previous" />
        <polyline points={points(currentValues, max)} className="gym-analytics-chart__current" />
      </svg>
    </div>
  );
}
