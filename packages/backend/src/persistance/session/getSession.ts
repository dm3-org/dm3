import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getSession(redis: Redis) {
    return async (ensName: string) => {
        const session = await redis.get(RedisPrefix.Session + ensName);
        if (!session) {
            return null;
        }

        return JSON.parse(session) as Lib.delivery.Session;
    };
}
