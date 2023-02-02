import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';
import { getIdEnsName } from '../session/getIdEnsName';

export function getUserStorage(redis: Redis) {
    return async (ensName: string): Promise<Lib.storage.UserStorage | null> => {
        const userStorage = await redis.get(
            RedisPrefix.UserStorage + (await getIdEnsName(redis)(ensName)),
        );
        return userStorage ? JSON.parse(userStorage) : null;
    };
}
