import { getIdEnsName, Redis } from '@dm3-org/dm3-lib-server-side';
import { UserStorage } from '@dm3-org/dm3-lib-storage';
import { RedisPrefix } from '../getDatabase';

//Bring the old storage api temporarily back to allow testing without breaking changes
//Remove as soon a storage is fully migrated
export function getUserStorageOld(redis: Redis) {
    return async (ensName: string): Promise<UserStorage | null> => {
        const userStorage = await redis.get(
            RedisPrefix.UserStorage + (await getIdEnsName(redis)(ensName)),
        );
        return userStorage ? JSON.parse(userStorage) : null;
    };
}
