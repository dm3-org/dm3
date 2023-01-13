import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function setSession(redis: Redis) {
    return async (ensName: string, session: Lib.delivery.Session) => {
        const isValid = Lib.validateSchema(
            Lib.delivery.schema.SessionSchema,
            session,
        );

        if (!isValid) {
            throw Error('Invalid session');
        }
        await redis.set(RedisPrefix.Session + ensName, Lib.stringify(session));
    };
}
