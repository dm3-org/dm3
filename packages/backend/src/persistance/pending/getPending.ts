import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getPending(redis: Redis) {
    return (ensName: string): Promise<string[]> => {
        return redis.sMembers(
            RedisPrefix.Pending + Lib.account.normalizeEnsName(ensName),
        );
    };
}
