import { Session } from '@dm3-org/dm3-lib-delivery';
import { ethers } from 'ethers';
import { Redis, RedisPrefix } from '../getDatabase';

export function getAccount(redis: Redis) {
    return async (address: string) => {
        console.log(ethers);
        const session = await redis.get(
            RedisPrefix.Account + ethers.utils.getAddress(address),
        );

        if (!session) {
            console.debug('there is no account for this address: ', address);
            return null;
        }

        return JSON.parse(session) as Session;
    };
}
