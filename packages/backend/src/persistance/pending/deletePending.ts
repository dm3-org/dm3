import { RedisPrefix } from '../../redis';
import { Redis } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export async function deletePending(redis: Redis) {
    return async (accountAddress: string): Promise<void> => {
        await redis.del(
            RedisPrefix.Pending + Lib.external.formatAddress(accountAddress),
        );
    };
}
