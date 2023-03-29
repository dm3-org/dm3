import * as Lib from 'dm3-lib/dist.backend';
import { Redis } from '../getDatabase';
import {
    ADDRESS_TO_PROFILE_KEY,
    NAME_TO_ADDRESS_KEY,
    USER_PROFILE_KEY,
    ADDRESS_TO_NAME_KEY,
} from '.';
import { ethers } from 'ethers';

/**
 *
 * @param {Redis} redis - Redis client
 * @param {string} name - ENS name
 * @param {Lib.account.UserProfile} profile - User Profile object
 * @param {string} address - Ethereum address
 * @returns {Promise<boolean>} - A promise that resolves to true if the profile is set successfully, false otherwise
 */
export function setUserProfile(redis: Redis) {
    return async (
        name: string,
        profile: Lib.account.SignedUserProfile,
        address: string,
    ) => {
        const profileIsValid = Lib.validateSchema(
            Lib.account.schema.SignedUserProfile,
            profile,
        );

        if (!profileIsValid) {
            throw Error('Invalid user profile');
        }

        const nameHash = ethers.utils.namehash(name);

        const writeResult = await redis.hSet(
            USER_PROFILE_KEY,
            nameHash,
            JSON.stringify(profile),
        );

        await redis.set(ADDRESS_TO_PROFILE_KEY + address, nameHash);
        await redis.set(NAME_TO_ADDRESS_KEY + nameHash, address);
        await redis.set(
            ADDRESS_TO_NAME_KEY +
                Lib.shared.ethersHelper.formatAddress(address),
            Lib.account.normalizeEnsName(name),
        );

        return !!writeResult;
    };
}
