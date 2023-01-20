import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getUserStorage(redis: Redis) {
    return async (ensName: string): Promise<Lib.storage.UserStorage | null> => {
        const userStorage = await redis.get(
            RedisPrefix.UserStorage + Lib.account.normalizeEnsName(ensName),
        );
        return userStorage ? JSON.parse(userStorage) : null;
    };
}
