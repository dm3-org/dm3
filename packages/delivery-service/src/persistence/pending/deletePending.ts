import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '@dm3-org/dm3-lib-server-side';

export function deletePending(redis: Redis) {
    return async (ensName: string): Promise<void> => {
        await redis.del(
            RedisPrefix.Pending + (await getIdEnsName(redis)(ensName)),
        );
    };
}
