import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';

export function doesAccountExist(redis: Redis) {
    return async (ensName: string) => {
        let account = await redis.get(
            RedisPrefix.Account + (await getIdEnsName(redis)(ensName)),
        );

        // return true if account exists, false otherwise
        return account ? true : false;
    };
}
