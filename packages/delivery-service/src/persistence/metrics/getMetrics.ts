import { Redis, RedisPrefix } from '../getDatabase';

export function getMetrics(redis: Redis): () => Promise<string> {
    return async () => {
        return JSON.stringify({ yesterday: 1, today: 2 });
    };
}
