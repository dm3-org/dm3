import { log } from 'dm3-lib-shared';
import { checkProfileHash, GetResource } from '../Profile';
import { Dm3Profile, ProfileResolver } from './ProfileResolver';

const isProfile = (textRecord: string) => {
    try {
        const { protocol } = new URL(textRecord);
        return protocol === 'http:' || protocol === 'https:';
    } catch (e) {
        return false;
    }
};

function resolveProfile<T extends Dm3Profile>(
    getResource: GetResource<T>,
    validate: (objectToCheck: T) => boolean,
) {
    return async (textRecord: string) => {
        log(`[getUserProfile] resolve link ${textRecord}`);
        const profile = await getResource(textRecord);

        if (!profile) {
            throw Error('Could not load profile');
        }

        if (!validate(profile)) {
            throw Error("SignedUserProfileSchema doesn't fit schema");
        }

        if (!checkProfileHash(profile, textRecord)) {
            throw Error('Profile hash check failed');
        }

        return profile;
    };
}

export function LinkResolver<T extends Dm3Profile>(
    getResource: GetResource<T>,
    validate: (objectToCheck: T) => boolean,
): ProfileResolver<T> {
    return {
        isProfile,
        resolveProfile: resolveProfile<T>(getResource, validate),
    };
}
