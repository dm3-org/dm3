import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getIdEnsName(redis: Redis) {
    return async (ensName: string) =>
        Lib.account.normalizeEnsName(
            (await redis.get(
                RedisPrefix.Session +
                    'alias:' +
                    Lib.account.normalizeEnsName(ensName),
            )) ?? ensName,
        );
}
