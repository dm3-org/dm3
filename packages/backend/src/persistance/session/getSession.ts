import { RedisPrefix } from '../../redis';
import { Redis } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getSession(redis: Redis) {
    return async (account: string) => {
        const session = await redis.get(
            RedisPrefix.Session + Lib.external.formatAddress(account),
        );
        if (!session) {
            return null;
        }

        return JSON.parse(session) as Lib.delivery.Session;
    };
}
