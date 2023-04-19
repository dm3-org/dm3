import { Redis, RedisPrefix } from '../getDatabase';
import { normalizeEnsName } from 'dm3-lib-profile/dist.backend';

export function addPending(redis: Redis) {
    return async (ensName: string, contactEnsName: string): Promise<void> => {
        await redis.sAdd(
            RedisPrefix.Pending + normalizeEnsName(contactEnsName),
            normalizeEnsName(ensName),
        );
    };
}
