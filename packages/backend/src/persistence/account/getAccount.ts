import { Redis, RedisPrefix } from '../getDatabase';
import { Session, spamFilter } from '@dm3-org/dm3-lib-delivery';
import { getIdEnsName } from '../getIdEnsName';

export function getAccount(redis: Redis) {
    return async (ensName: string) => {
        let session = await redis.get(
            RedisPrefix.Account + (await getIdEnsName(redis)(ensName)),
        );

        console.debug('get account ', ensName, session);

        return session
            ? (JSON.parse(session) as Session & {
                  spamFilterRules: spamFilter.SpamFilterRules;
              })
            : null;
    };
}
