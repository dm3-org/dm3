import { Redis, RedisPrefix } from '../getDatabase';
import { Session, schema } from '@dm3-org/dm3-lib-delivery';
import { validateSchema, stringify } from '@dm3-org/dm3-lib-shared';
import { getIdEnsName } from '../getIdEnsName';

export function setAccount(redis: Redis) {
    return async (ensName: string, session: Session) => {
        const isValid = validateSchema(schema.Session, session);

        if (!isValid) {
            throw Error('Invalid session');
        }
        console.debug('set account ', ensName, session);
        await redis.set(
            RedisPrefix.Account + (await getIdEnsName(redis)(ensName)),
            stringify(session),
        );
    };
}
