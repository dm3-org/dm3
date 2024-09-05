import { getMetrics } from './getMetrics';
import type { IntervalMetric, MetricsMap, MetricsObject } from './metricTypes';
import { countMessage, countNotification } from './setMetrics';

export default {
    getMetrics,
    countMessage,
    countNotification,
};

export type { IntervalMetric, MetricsMap, MetricsObject };
