import * as Lib from 'dm3-lib/dist.backend';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../session/getIdEnsName';

export function setUserStorage(redis: Redis) {
    return async (ensName: string, data: string): Promise<void> => {
        await redis.set(
            RedisPrefix.UserStorage + (await getIdEnsName(redis)(ensName)),
            Lib.stringify(data),
        );
    };
}
