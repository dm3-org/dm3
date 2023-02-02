import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../session/getIdEnsName';

export function deletePending(redis: Redis) {
    return async (ensName: string): Promise<void> => {
        await redis.del(
            RedisPrefix.Pending + (await getIdEnsName(redis)(ensName)),
        );
    };
}
