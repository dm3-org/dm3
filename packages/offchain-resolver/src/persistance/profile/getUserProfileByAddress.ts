import { ADDRESS_TO_PROFILE_KEY, getUserProfile, USER_PROFILE_KEY } from '.';
import { Redis } from '../getDatabase';

import * as Lib from 'dm3-lib/dist.backend';

export function getUserProfileByAddress(redis: Redis) {
    return async (address: string) => {
        const namehash = await redis.get(ADDRESS_TO_PROFILE_KEY + address);

        if (!namehash) {
            return null;
        }
        const isMember = await redis.hExists(USER_PROFILE_KEY, namehash);
        if (!isMember) {
            return null;
        }
        const stringifiedUserProfile = await redis.hGet(
            USER_PROFILE_KEY,
            namehash,
        );

        return JSON.parse(stringifiedUserProfile!) as Lib.account.UserProfile;
    };
}
