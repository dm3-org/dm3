import { RedisPrefix } from '../../redis';
import { Redis } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function addPending(redis: Redis) {
    return async (
        accountAddress: string,
        contactAddress: string,
    ): Promise<void> => {
        await redis.sAdd(
            RedisPrefix.Pending + Lib.external.formatAddress(contactAddress),
            Lib.external.formatAddress(accountAddress),
        );
    };
}
