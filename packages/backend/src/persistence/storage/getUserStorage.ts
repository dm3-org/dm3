import { Redis, getIdEnsName } from '@dm3-org/dm3-lib-server-side';
import { UserStorage } from '@dm3-org/dm3-lib-storage';
import { RedisPrefix } from '../getDatabase';

export function getUserStorageChunk(redis: Redis) {
    return async (
        ensName: string,
        key: string,
    ): Promise<UserStorage | null> => {
        const userStorage = await redis.get(
            `${RedisPrefix.UserStorage}${await getIdEnsName(redis)(
                ensName,
            )}:${key}`,
        );
        return userStorage ? JSON.parse(userStorage) : null;
    };
}
