import { ethers } from 'ethers';
import {
    SignedUserProfile,
    normalizeEnsName,
    schema,
    formatAddress,
} from '@dm3-org/dm3-lib-profile';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 *
 * @param {Redis} redis - Redis client
 * @param {string} name - ENS name
 * @param {Lib.profile.UserProfile} profile - User Profile object
 * @param {string} address - Ethereum address
 * @returns {Promise<boolean>} - A promise that resolves to true if the profile is set successfully, false otherwise
 */
export function setUserProfile(db: PrismaClient) {
    return async (
        name: string,
        profile: SignedUserProfile,
        address: string,
    ) => {
        const profileIsValid = validateSchema(
            schema.SignedUserProfile,
            profile,
        );

        if (!profileIsValid) {
            throw Error('Invalid user profile');
        }

        const nameHash = ethers.utils.namehash(name);

        try {
            const id = uuidv4();
            console.debug({
                message: 'pre setUserProfile',
                id,
                nameHash,
                profile: JSON.stringify(profile),
                address: formatAddress(address),
                ensName: normalizeEnsName(name),
            });
            await db.profileContainer.create({
                data: {
                    id,
                    nameHash,
                    profile: JSON.stringify(profile),
                    address: formatAddress(address),
                    ensName: normalizeEnsName(name),
                },
            });

            return true;
        } catch (e) {
            console.warn({
                message: `setUserProfile error`,
                error: JSON.stringify(e),
            });
            return false;
        }
    };
}
