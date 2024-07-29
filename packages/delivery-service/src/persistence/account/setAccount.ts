import { Session, schema } from '@dm3-org/dm3-lib-delivery';
import { stringify, validateSchema } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { Redis, RedisPrefix } from '../getDatabase';

export function setAccount(redis: Redis) {
    return async (address: string, session: Session) => {
        const isValid = validateSchema(schema.Session, session);
        const isAddess = ethers.utils.isAddress(address);

        if (!isValid) {
            console.debug('Invalid session: ', session);
            throw Error('Invalid session');
        }

        if (!isAddess) {
            console.debug('Invalid address: ', address);
            throw Error('Invalid address');
        }

        console.debug('set account ', address, session);

        await redis.set(
            RedisPrefix.Account + ethers.utils.getAddress(address),
            stringify(session),
        );
    };
}
