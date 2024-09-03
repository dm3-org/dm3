import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsMap, IntervalMetric } from './metricTypes';

export function getMetrics(redis: Redis): () => Promise<MetricsMap> {
    return async () => {
        const metrics: MetricsMap = new Map<Date, IntervalMetric>();
        const messageCountKeys = await redis.keys(
            `${RedisPrefix.MetricsMessageCount}*`,
        );

        for (const key of messageCountKeys) {
            const timestamp = parseInt(key.split(':')[1], 10);
            const date = new Date(timestamp * 1000);

            const messageCount = await redis.get(key);
            const messageSizeBytes = await redis.get(
                `${RedisPrefix.MetricsMessageSize}${timestamp}`,
            );
            const notificationCount = await redis.get(
                `${RedisPrefix.MetricsNotificationCount}${timestamp}`,
            );

            metrics.set(date, {
                messageCount: parseInt(messageCount || '0', 10),
                messageSizeBytes: parseInt(messageSizeBytes || '0', 10),
                notificationCount: parseInt(notificationCount || '0', 10),
            });
        }

        return metrics;
    };
}
