import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../session/getIdEnsName';

export function getPending(redis: Redis) {
    return async (ensName: string): Promise<string[]> => {
        return redis.sMembers(
            RedisPrefix.Pending + (await getIdEnsName(redis)(ensName)),
        );
    };
}
