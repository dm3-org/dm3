import { stringify } from 'dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';

export function setUserStorageChunk(redis: Redis) {
    return async (
        ensName: string,
        key: string,
        data: string,
    ): Promise<void> => {
        await redis.set(
            `${RedisPrefix.UserStorage}${await getIdEnsName(redis)(
                ensName,
            )}:${key}`,
            stringify(data),
        );
    };
}
