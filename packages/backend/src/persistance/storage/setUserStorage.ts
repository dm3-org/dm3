import * as Lib from 'dm3-lib/dist.backend';
import { Redis, RedisPrefix } from '../getDatabase';

export function setUserStorage(redis: Redis) {
    return async (accountAddress: string, data: string): Promise<void> => {
        await redis.set(
            RedisPrefix.UserStorage +
                Lib.external.formatAddress(accountAddress),
            Lib.stringify(data),
        );
    };
}
