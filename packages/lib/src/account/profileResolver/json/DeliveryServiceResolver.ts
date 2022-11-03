import { DeliveryServiceProfile } from '../../../delivery/Delivery';
import { log } from '../../../shared/log';
import { UserProfile } from '../../Account';

export function isProfile(textRecord: string) {
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
}

function resolveProfile(textRecord: string) {
    log(`[getUserProfile] Resolve Json profile `);

    const { profile, signature } = JSON.parse(textRecord);
    const {
        publicEncryptionKey,
        publicSigningKey,
        url,
    }: Partial<DeliveryServiceProfile> = profile;

    return {
        publicEncryptionKey,
        publicSigningKey,
        url,
    } as DeliveryServiceProfile;
}
export function DeliveryServiceResolver() {
    return {
        isProfile,
        resolveProfile,
    };
}
