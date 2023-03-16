import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function addPending(redis: Redis) {
    return async (ensName: string, contactEnsName: string): Promise<void> => {
        await redis.sAdd(
            RedisPrefix.Pending + Lib.account.normalizeEnsName(contactEnsName),
            Lib.account.normalizeEnsName(ensName),
        );
    };
}
