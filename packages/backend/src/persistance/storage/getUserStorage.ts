import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getUserStorage(redis: Redis) {
    return async (
        accountAddress: string,
    ): Promise<Lib.storage.UserStorage | null> => {
        const userStorage = await redis.get(
            RedisPrefix.UserStorage +
                Lib.external.formatAddress(accountAddress),
        );
        return userStorage ? JSON.parse(userStorage) : null;
    };
}
