import { log } from '../../shared/log';
import { SignedUserProfile, UserProfile } from '../Account';
import { ProfileResolver } from './ProfileResolver';

const isProfile = (textRecord: string) => {
    try {
        const { profile, signature } = JSON.parse(textRecord);
        const {
            publicEncryptionKey,
            publicSigningKey,
            deliveryServices,
        }: Partial<UserProfile> = profile;

        // eslint-disable-next-line max-len
        //If the profile string contains all 3 mandatory fields, and the according signature the string can be considered valid
        return !!(
            signature &&
            publicEncryptionKey &&
            publicSigningKey &&
            deliveryServices
        );
    } catch (e) {
        return false;
    }
};

const resolveProfile = () => async (textRecord: string) => {
    log(`[getUserProfile] Resolve Json profile `);

    const { profile, signature } = JSON.parse(textRecord);
    const {
        publicEncryptionKey,
        publicSigningKey,
        deliveryServices,
        mutableProfileExtensionUrl,
    }: Partial<UserProfile> = profile;

    return {
        profile: {
            publicEncryptionKey,
            publicSigningKey,
            deliveryServices,
            mutableProfileExtensionUrl,
        },
        signature,
    } as SignedUserProfile;
};

export const JsonResolver = (): ProfileResolver => {
    return {
        isProfile,
        resolveProfile: resolveProfile(),
    };
};
