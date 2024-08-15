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
        const metrics: Map<Date, IntervalMetric> = new Map<
            Date,
            IntervalMetric
        >();
        metrics.set(new Date('2024-08-09'), {
            messageCount: 294,
            messageSizeBytes: 29424,
            notificationCount: 29,
        });
        metrics.set(new Date('2024-08-10'), {
            messageCount: 20,
            messageSizeBytes: 294,
            notificationCount: 2,
        });
        metrics.set(new Date('2024-08-11'), {
            messageCount: 24,
            messageSizeBytes: 294,
            notificationCount: 9,
        });
        console.log('metrics', metrics);
        return metrics;
    };
}
