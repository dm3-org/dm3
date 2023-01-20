import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function deletePending(redis: Redis) {
    return async (ensName: string): Promise<void> => {
        await redis.del(
            RedisPrefix.Pending + Lib.account.normalizeEnsName(ensName),
        );
    };
}
