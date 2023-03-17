import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';
import { getIdEnsName } from './getIdEnsName';

export function setSession(redis: Redis) {
    return async (ensName: string, session: Lib.delivery.Session) => {
        const isValid = Lib.validateSchema(
            Lib.delivery.schema.Session,
            session,
        );

        if (!isValid) {
            throw Error('Invalid session');
        }
        await redis.set(
            RedisPrefix.Session + (await getIdEnsName(redis)(ensName)),
            Lib.stringify(session),
        );
    };
}

export function setAliasSession(redis: Redis) {
    return async (ensName: string, aliasEnsName: string) => {
        await redis.set(
            RedisPrefix.Session +
                'alias:' +
                Lib.account.normalizeEnsName(aliasEnsName),
            Lib.account.normalizeEnsName(ensName),
        );
    };
}
