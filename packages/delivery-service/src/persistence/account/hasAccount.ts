import { Redis, RedisPrefix } from '../getDatabase';
import { ethers } from 'ethers';

export function hasAccount(redis: Redis) {
    return async (address: string) => {
        let account = await redis.get(
            RedisPrefix.Account + ethers.utils.getAddress(address),
        );

        // return true if account exists, false otherwise
        return !!account;
    };
}
