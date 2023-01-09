import * as Lib from 'dm3-lib/dist.backend';
import { USER_PROFILE_KEY } from '.';
import { Redis } from '../getDatabase';

export function getUserProfile(redis: Redis) {
    return async (name: string) => {
        const isMember = await redis.hExists(USER_PROFILE_KEY, name);
        if (!isMember) {
            return null;
        }

        const stringifiedUserProfile = await redis.hGet(USER_PROFILE_KEY, name);

        return JSON.parse(stringifiedUserProfile!) as Lib.account.UserProfile;
    };
}
