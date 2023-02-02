import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';
import { getIdEnsName } from './getIdEnsName';

export function getSession(redis: Redis) {
    return async (ensName: string) => {
        let session = await redis.get(
            RedisPrefix.Session + (await getIdEnsName(redis)(ensName)),
        );

        return session ? (JSON.parse(session) as Lib.delivery.Session) : null;
    };
}
