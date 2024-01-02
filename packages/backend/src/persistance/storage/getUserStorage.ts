import { Redis, RedisPrefix } from '../getDatabase';
import { UserStorage } from 'dm3-lib-storage';
import { getIdEnsName } from '../getIdEnsName';

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
