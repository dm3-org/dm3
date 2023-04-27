import { Redis, RedisPrefix } from '../getDatabase';
import { normalizeEnsName } from 'dm3-lib-profile/dist.backend';

export function getIdEnsName(redis: Redis) {
    return async (ensName: string) =>
        normalizeEnsName(
            (await redis.get(
                RedisPrefix.Session + 'alias:' + normalizeEnsName(ensName),
            )) ?? ensName,
        );
}
