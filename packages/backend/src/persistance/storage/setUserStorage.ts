import { stringify } from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';

export function setUserStorage(redis: Redis) {
    return async (ensName: string, data: string): Promise<void> => {
        await redis.set(
            RedisPrefix.UserStorage + (await getIdEnsName(redis)(ensName)),
            stringify(data),
        );
    };
}
