import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '@dm3-org/dm3-lib-server-side';

export function getPending(redis: Redis) {
    return async (ensName: string): Promise<string[]> => {
        return redis.sMembers(
            RedisPrefix.Pending + (await getIdEnsName(redis)(ensName)),
        );
    };
}
