import { Redis, RedisPrefix } from '../getDatabase';
import { ethers } from 'ethers';

export function hasAccount(redis: Redis) {
    return async (address: string) => {
        if (!ethers.utils.isAddress(address)) {
            console.debug('hasAccount: Invalid address: ', address);
            throw Error('hasAccount: Invalid address');
        }

        let account = await redis.get(
            RedisPrefix.Account + ethers.utils.getAddress(address),
        );

        // return true if account exists, false otherwise
        return !!account;
    };
}
