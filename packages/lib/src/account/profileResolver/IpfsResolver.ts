import { log } from '../../shared/log';
import { Dm3Profile } from './ProfileResolver';
import { GetResource } from '../Account';

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
) {
    return async (textRecord: string) => {
        log(`[getUserProfile] resolve ipfs link ${textRecord}`);

        const ipfsGatewayUrl = 'https://www.ipfs.io/ipfs';
        const cid = textRecord.substring(7);

        const profile = await getResource(`${ipfsGatewayUrl}/${cid}`);

        if (!profile) {
            throw Error('Could not load profile');
        }

        return profile;
    };
}
export function IpfsResolver<T extends Dm3Profile>(
    getResource: GetResource<T>,
) {
    return {
        isProfile,
        resolveProfile: resolveProfile(getResource),
    };
}
