import { USER_PROFILE_KEY } from '.';
import { Redis } from '../getDatabase';
import { UserProfileDto } from '../IDatabase';

export function getUserProfile(redis: Redis) {
    return async (name: string) => {
        const isMember = await redis.hExists(USER_PROFILE_KEY, name);
        if (!isMember) {
            return null;
        }

        const stringifiedUserProfile = await redis.hGet(USER_PROFILE_KEY, name);

        return JSON.parse(stringifiedUserProfile!) as UserProfileDto;
    };
}
