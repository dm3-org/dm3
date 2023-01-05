import { UserProfileDto } from '../IDatabase';
import * as Lib from 'dm3-lib/dist.backend';
import { Redis } from '../getDatabase';
import { USER_PROFILE_KEY } from '.';

export function setUserProfile(redis: Redis) {
    return async (ensName: string, userProfileDto: UserProfileDto) => {
        const { profile, signatures } = userProfileDto;

        const profileIsValid = Lib.validateSchema(
            Lib.account.schema.SignedUserProfile.definitions.UserProfile,
            profile,
        );

        const signaturesAreValid = Lib.validateSchema(
            { type: 'array', items: { type: 'string' } },
            signatures,
        );

        const isValid = profileIsValid && signaturesAreValid;

        if (!isValid) {
            throw Error('Invalid user profile');
        }

        const writeResult = await redis.hSet(
            USER_PROFILE_KEY,
            ensName,
            JSON.stringify(userProfileDto),
        );

        return !!writeResult;
    };
}
