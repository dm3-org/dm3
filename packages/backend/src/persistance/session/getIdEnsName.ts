import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getIdEnsName(redis: Redis) {
    return async (ensName: string) =>
        Lib.profile.normalizeEnsName(
            (await redis.get(
                RedisPrefix.Session +
                    'alias:' +
                    Lib.profile.normalizeEnsName(ensName),
            )) ?? ensName,
        );
}
