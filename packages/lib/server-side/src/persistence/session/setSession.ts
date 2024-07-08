import { Redis, RedisPrefixShared } from '../getDatabase';
import { Session, schema } from '@dm3-org/dm3-lib-delivery';
import { validateSchema, stringify } from '@dm3-org/dm3-lib-shared';
import { getIdEnsName } from '../getIdEnsName';

export function setSession(redis: Redis) {
    return async (ensName: string, session: Session) => {
        const isValid = validateSchema(schema.Session, session);

        if (!isValid) {
            throw Error('Invalid session');
        }
        await redis.set(
            RedisPrefixShared.Session + (await getIdEnsName(redis)(ensName)),
            stringify(session),
        );
    };
}
