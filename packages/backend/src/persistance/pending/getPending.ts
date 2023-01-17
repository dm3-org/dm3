import { RedisPrefix } from '../../redis';
import { Redis } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export async function getPending(redis: Redis) {
    return (accountAddress: string): Promise<string[]> => {
        return redis.sMembers(
            RedisPrefix.Pending + Lib.external.formatAddress(accountAddress),
        );
    };
}
