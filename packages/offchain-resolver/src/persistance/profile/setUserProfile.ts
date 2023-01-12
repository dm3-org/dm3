import * as Lib from 'dm3-lib/dist.backend';
import { Redis } from '../getDatabase';
import { USER_PROFILE_KEY } from '.';
import { ethers } from 'ethers';

export function setUserProfile(redis: Redis) {
    return async (name: string, profile: Lib.account.UserProfile) => {
        const profileIsValid = Lib.validateSchema(
            Lib.account.schema.SignedUserProfile.definitions.UserProfile,
            profile,
        );

        if (!profileIsValid) {
            throw Error('Invalid user profile');
        }

        const nameHash = ethers.utils.nameprep(ethers.utils.namehash(name));

        const writeResult = await redis.hSet(
            USER_PROFILE_KEY,
            nameHash,
            JSON.stringify(profile),
        );

        return !!writeResult;
    };
}
