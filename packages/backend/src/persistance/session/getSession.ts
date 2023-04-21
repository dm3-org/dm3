import { Redis, RedisPrefix } from '../getDatabase';
import { Session, spamFilter } from 'dm3-lib-delivery/dist.backend';
import { getIdEnsName } from './getIdEnsName';

export function getSession(redis: Redis) {
    return async (ensName: string) => {
        let session = await redis.get(
            RedisPrefix.Session + (await getIdEnsName(redis)(ensName)),
        );

        return session
            ? (JSON.parse(session) as Session & {
                  spamFilterRules: spamFilter.SpamFilterRules;
              })
            : null;
    };
}
