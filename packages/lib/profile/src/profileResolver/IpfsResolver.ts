import { logInfo } from '@dm3-org/dm3-lib-shared';
import { Dm3Profile, ProfileResolver } from './ProfileResolver';
import { GetResource } from '../Profile';

const isProfile = (textRecord: string) => {
    try {
        const { protocol } = new URL(textRecord);
        return protocol === 'ipfs:';
    } catch (e) {
        return false;
    }
};

export function resolveProfile<T extends Dm3Profile>(
    getResource: GetResource<T>,
    validate: (objectToCheck: T) => boolean,
) {
    return async (textRecord: string) => {
        logInfo({ text: `[getUserProfile] resolve ipfs link`, textRecord });

        const ipfsGatewayUrl = 'https://www.ipfs.io/ipfs';
        const cid = textRecord.substring(7);

        const profile = await getResource(`${ipfsGatewayUrl}/${cid}`);

        if (!profile) {
            throw Error('Could not load profile');
        }
        if (!validate(profile)) {
            throw Error("SignedUserProfileSchema doesn't fit schema");
        }
        return profile;
    };
}
export function IpfsResolver<T extends Dm3Profile>(
    getResource: GetResource<T>,
    validate: (objectToCheck: T) => boolean,
): ProfileResolver<T> {
    return {
        isProfile,
        resolveProfile: resolveProfile(getResource, validate),
    };
}
