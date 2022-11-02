import { log } from '../../shared/log';
import { checkProfileHash, GetResource } from '../Account';
import { UserProfileResolver } from './UserProfileResolver';

const isProfile = (textRecord: string) => {
    try {
        const { protocol } = new URL(textRecord);
        return protocol === 'http:' || protocol === 'https:';
    } catch (e) {
        return false;
    }
};

const resolveProfile =
    (getResource: GetResource) => async (textRecord: string) => {
        log(`[getUserProfile] resolve link ${textRecord}`);
        const profile = await getResource(textRecord);

        if (!profile) {
            throw Error('Could not load profile');
        }

        if (!checkProfileHash(profile, textRecord)) {
            throw Error('Profile hash check failed');
        }
        return profile;
    };

export const LinkResolver = (getResource: GetResource): UserProfileResolver => {
    return {
        isProfile,
        resolveProfile: resolveProfile(getResource),
    };
};
