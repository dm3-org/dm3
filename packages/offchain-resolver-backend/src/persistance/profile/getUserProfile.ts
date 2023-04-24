/* eslint-disable max-len */
import { UserProfile } from 'dm3-lib-profile/dist.backend';
import { USER_PROFILE_KEY } from '.';
import { Redis } from '../getDatabase';
import { ethers } from 'ethers';

/**
 *
 * @param {Redis} redis - Redis client
 * @param {string} name - Ethereum name
 * @returns {Promise<Lib.profile.UserProfile>} A promise that resolves to the user profile object or null if the user is not found
 */
export function getUserProfile(redis: Redis) {
    return async (name: string) => {
        const nameHash = ethers.utils.namehash(name);

        const isMember = await redis.hExists(USER_PROFILE_KEY, nameHash);
        if (!isMember) {
            return null;
        }

        const stringifiedUserProfile = await redis.hGet(
            USER_PROFILE_KEY,
            nameHash,
        );

        return JSON.parse(stringifiedUserProfile!) as UserProfile;
    };
}
