import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsMap, IntervalMetric } from './metricTypes';

// https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map

// @ts-ignore
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

// function reviver(key, value) {
//     if (typeof value === 'object' && value !== null) {
//         if (value.dataType === 'Map') {
//             return new Map(value.value);
//         }
//     }
//     return value;
// }

export function getMetrics(redis: Redis): () => Promise<MetricsMap> {
    return async () => {
        const metrics: MetricsMap = new Map<Date, IntervalMetric>();
        const keys = await redis.keys('metrics:*');

        for (const key of keys) {
            const timestamp = parseInt(key.split(':')[1], 10);
            const date = new Date(timestamp * 1000);
            const messageCount = await redis.get(`${key}:messageCount`);
            const messageSizeBytes = await redis.get(`${key}:messageSizeBytes`);
            const notificationCount = await redis.get(
                `${key}:notificationCount`,
            );

            metrics.set(date, {
                messageCount: parseInt(messageCount ? messageCount : '0', 10),
                messageSizeBytes: parseInt(
                    messageSizeBytes ? messageSizeBytes : '0',
                    10,
                ),
                notificationCount: parseInt(
                    notificationCount ? notificationCount : '0',
                    10,
                ),
            });
        }

        return metrics;
    };
}
