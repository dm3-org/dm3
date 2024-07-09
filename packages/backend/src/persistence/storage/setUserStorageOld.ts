import { stringify } from '@dm3-org/dm3-lib-shared';
import { RedisPrefix } from '../getDatabase';
import { getIdEnsName, Redis } from '@dm3-org/dm3-lib-server-side';

export function setUserStorageOld(redis: Redis) {
    return async (ensName: string, data: string): Promise<void> => {
        await redis.set(
            RedisPrefix.UserStorage + (await getIdEnsName(redis)(ensName)),
            stringify(data),
        );
    };
}
