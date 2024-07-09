import { IGlobalNotification } from '@dm3-org/dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '@dm3-org/dm3-lib-server-side';

// Returns the global notification setting
export function getGlobalNotification(redis: Redis) {
    return async (ensName: string): Promise<IGlobalNotification> => {
        // Fetch the global notification record from the Redis
        const globalNotification = await redis.get(
            RedisPrefix.GlobalNotification +
                (await getIdEnsName(redis)(ensName)),
        );

        // return if exists else return false
        return globalNotification
            ? (JSON.parse(globalNotification) as IGlobalNotification)
            : ({ isEnabled: false } as IGlobalNotification);
    };
}
