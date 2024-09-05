import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { getCurrentIntervalTimestamp } from './getCurrentIntervalTimestamp';
import { MetricsObject } from './metricTypes';

export function getMetrics(
    redis: Redis,
): (
    deliveryServiceProperties: DeliveryServiceProperties,
) => Promise<MetricsObject> {
    return async (deliveryServiceProperties: DeliveryServiceProperties) => {
        const metrics: MetricsObject = {};
        const messageCountKeys = await redis.keys(
            `${RedisPrefix.MetricsMessageCount}*`,
        );

        const currentTimestamp = getCurrentIntervalTimestamp(
            deliveryServiceProperties.metricsCollectionIntervalInSeconds,
        );

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