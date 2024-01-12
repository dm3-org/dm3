import { Redis, RedisPrefix } from '../getDatabase';
import { UserStorage } from '@dm3-org/dm3-lib-storage';
import { getIdEnsName } from '../getIdEnsName';

export function getUserStorage(redis: Redis) {
    return async (ensName: string): Promise<UserStorage | null> => {
        const userStorage = await redis.get(
            RedisPrefix.UserStorage + (await getIdEnsName(redis)(ensName)),
        );
        return userStorage ? JSON.parse(userStorage) : null;
    };
}
