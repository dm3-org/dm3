import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getPending(redis: Redis) {
    return (accountAddress: string): Promise<string[]> => {
        return redis.sMembers(
            RedisPrefix.Pending + Lib.external.formatAddress(accountAddress),
        );
    };
}
