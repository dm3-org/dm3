import { getIdEnsName, Redis } from '@dm3-org/dm3-lib-server-side';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { RedisPrefix } from '../getDatabase';

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
