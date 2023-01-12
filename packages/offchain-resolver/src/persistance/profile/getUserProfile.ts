import * as Lib from 'dm3-lib/dist.backend';
import { USER_PROFILE_KEY } from '.';
import { Redis } from '../getDatabase';
import { ethers } from 'ethers';

export function getUserProfile(redis: Redis) {
    return async (name: string) => {
        const nameHash = ethers.utils.nameprep(ethers.utils.namehash(name));

        const isMember = await redis.hExists(USER_PROFILE_KEY, nameHash);
        if (!isMember) {
            return null;
        }

        const stringifiedUserProfile = await redis.hGet(
            USER_PROFILE_KEY,
            nameHash,
        );

        return JSON.parse(stringifiedUserProfile!) as Lib.account.UserProfile;
    };
}
