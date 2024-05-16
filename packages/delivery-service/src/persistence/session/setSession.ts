import { Redis, RedisPrefix } from '../getDatabase';
import { Session, schema } from '@dm3-org/dm3-lib-delivery';
import { validateSchema, stringify } from '@dm3-org/dm3-lib-shared';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { getIdEnsName } from '../getIdEnsName';

export function setSession(redis: Redis) {
    return async (ensName: string, session: Session) => {
        const isValid = validateSchema(schema.Session, session);

        if (!isValid) {
            throw Error('Invalid session');
        }
        await redis.set(
            RedisPrefix.Session + (await getIdEnsName(redis)(ensName)),
            stringify(session),
        );
    };
}
