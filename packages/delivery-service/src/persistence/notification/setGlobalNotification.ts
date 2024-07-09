import { stringify } from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '@dm3-org/dm3-lib-server-side';

export function setGlobalNotification(redis: Redis) {
    return async (ensName: string, isEnabled: boolean) => {
        // Store the global notification setting into Redis
        await redis.set(
            RedisPrefix.GlobalNotification +
                (await getIdEnsName(redis)(ensName)),
            stringify({ isEnabled }),
        );
    };
}
