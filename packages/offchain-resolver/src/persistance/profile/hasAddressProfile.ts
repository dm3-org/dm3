import { ADDRESS_TO_PROFILE_KEY } from '.';
import { Redis } from '../getDatabase';
/**
 * Check if the given address has a profile
 * @param {Redis} redis - Redis client
 * @param {string} address - Ethereum address
 * @returns {Promise<boolean>} - A promise that resolves to true if the address has a profile, false otherwise
 */
export function hasAddressProfile(redis: Redis) {
    return async (address: string) => {
        return !!(await redis.get(ADDRESS_TO_PROFILE_KEY + address));
    };
}
