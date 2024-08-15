import { getMetrics } from './getMetrics';
import type { IntervalMetric, MetricsMap } from './metricTypes';
import { setMetrics } from './setMetrics';
import { stringifyMetrics } from './stringifyMetrics';

export default {
    getMetrics,
    setMetrics,
    stringifyMetrics,
};

export type { IntervalMetric, MetricsMap };
