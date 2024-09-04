import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsObject, IntervalMetric } from './metricTypes';

export function getMetrics(redis: Redis): () => Promise<MetricsObject> {
    return async () => {
        const metrics: MetricsObject = {};
        const messageCountKeys = await redis.keys(
            `${RedisPrefix.MetricsMessageCount}*`,
        );

        // todo: censor current interval
        // todo: cast to zero if not found (e.g. no messages received during interval)

        for (const key of messageCountKeys) {
            const timestamp = parseInt(key.split(':')[1], 10);
            const date = new Date(timestamp * 1000);
            const dateString = date.toISOString();

            const messageCount = await redis.get(key);
            const messageSizeBytes = await redis.get(
                `${RedisPrefix.MetricsMessageSize}${timestamp}`,
            );
            const notificationCount = await redis.get(
                `${RedisPrefix.MetricsNotificationCount}${timestamp}`,
            );

            metrics[dateString] = {
                messageCount: parseInt(messageCount || '0', 10),
                messageSizeBytes: parseInt(messageSizeBytes || '0', 10),
                notificationCount: parseInt(notificationCount || '0', 10),
            };
        }

        return metrics;
    };
}
