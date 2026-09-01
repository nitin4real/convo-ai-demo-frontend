import { describe, expect, it } from 'vitest';
import {
  getMetricModuleLabel,
  getMetricNameLabel,
  METRIC_DEFINITIONS,
} from './metric-definitions';

describe('metric display definitions', () => {
  it('uses compact labels for the widest metric headings', () => {
    expect(getMetricModuleLabel('algorithm')).toBe('ALGO');
    expect(getMetricModuleLabel('transport')).toBe('NET');
    expect(getMetricNameLabel('processing')).toBe('PROC');
    expect(getMetricNameLabel('latency')).toBe('LAT');
  });

  it('provides a brief explanation for every displayed turn metric', () => {
    expect(METRIC_DEFINITIONS).toHaveLength(7);
    METRIC_DEFINITIONS.forEach(metric => {
      expect(metric.shortLabel.length).toBeGreaterThan(0);
      expect(metric.name.length).toBeGreaterThan(0);
      expect(metric.description.length).toBeGreaterThan(0);
    });
  });
});
