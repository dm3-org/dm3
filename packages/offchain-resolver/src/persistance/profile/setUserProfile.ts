import * as Lib from 'dm3-lib/dist.backend';
import { Redis } from '../getDatabase';
import { USER_PROFILE_KEY } from '.';

export function setUserProfile(redis: Redis) {
    return async (ensName: string, profile: Lib.account.UserProfile) => {
        const profileIsValid = Lib.validateSchema(
            Lib.account.schema.SignedUserProfile.definitions.UserProfile,
            profile,
        );

        if (!profileIsValid) {
            throw Error('Invalid user profile');
        }

        const writeResult = await redis.hSet(
            USER_PROFILE_KEY,
            ensName,
            JSON.stringify(profile),
        );

        return !!writeResult;
    };
}
