import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';
import { getIdEnsName } from '../session/getIdEnsName';

export function addPending(redis: Redis) {
    return async (ensName: string, contactEnsName: string): Promise<void> => {
        await redis.sAdd(
            RedisPrefix.Pending + Lib.account.normalizeEnsName(contactEnsName),
            await getIdEnsName(redis)(ensName),
        );
    };
}
