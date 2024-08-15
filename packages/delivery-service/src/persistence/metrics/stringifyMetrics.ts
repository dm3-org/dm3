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

export function stringifyMetrics(metrics: MetricsMap) {
    return JSON.stringify(metrics, replacer);
}
