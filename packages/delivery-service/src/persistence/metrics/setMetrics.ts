import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsMap, IntervalMetric } from './metricTypes';
import { stringifyMetrics } from './stringifyMetrics';

export function setMetrics(redis: Redis) {
    return async (metrics: MetricsMap) => {
        console.log('writing metrics to database:', metrics);
        const metricsString = stringifyMetrics(metrics);
        await redis.set(RedisPrefix.Metrics, metricsString);
    };
}
