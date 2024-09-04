import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsObject, IntervalMetric } from './metricTypes';

const INTERVAL_SECONDS = parseInt(
    process.env.METRICS_INTERVAL_SECONDS || '86400',
); // 1 day

function getCurrentIntervalTimestamp(): number {
    return Math.floor(Date.now() / 1000 / INTERVAL_SECONDS) * INTERVAL_SECONDS;
}

export function getMetrics(redis: Redis): () => Promise<MetricsObject> {
    return async () => {
        const metrics: MetricsObject = {};
        const messageCountKeys = await redis.keys(
            `${RedisPrefix.MetricsMessageCount}*`,
        );

        const currentTimestamp = getCurrentIntervalTimestamp();

        for (const key of messageCountKeys) {
            const timestamp = parseInt(key.split(':')[1], 10);

            // Skip the current interval
            // if (timestamp === currentTimestamp) {
            //     continue;
            // }

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
