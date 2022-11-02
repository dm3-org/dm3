import { log } from '../../shared/log';
import { checkProfileHash, GetResource } from '../Account';
import { UserProfileResolver } from './UserProfileResolver';

const isProfile = (textRecord: string) => {
    try {
        const { protocol } = new URL(textRecord);
        return protocol === 'ipfs:';
    } catch (e) {
        return false;
    }
};

const resolveProfile =
    (getResource: GetResource) => async (textRecord: string) => {
        log(`[getUserProfile] resolve ipfs link ${textRecord}`);

        const ipfsGatewayUrl = 'https://www.ipfs.io/ipfs';
        const cid = textRecord.substring(7);

        const profile = await getResource(`${ipfsGatewayUrl}/${cid}`);

        if (!profile) {
            throw Error('Could not load profile');
        }

        return profile;
    };

export const IpfsResolver = (getResource: GetResource): UserProfileResolver => {
    return {
        isProfile,
        resolveProfile: resolveProfile(getResource),
    };
};
