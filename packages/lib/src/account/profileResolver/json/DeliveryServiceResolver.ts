import { DeliveryServiceProfile } from '../../../delivery/Delivery';
import { log } from '../../../shared/log';
import { UserProfile } from '../../Account';

export function isProfile(textRecord: string) {
    try {
        const {
            publicEncryptionKey,
            publicSigningKey,
            url,
        }: Partial<DeliveryServiceProfile> = JSON.parse(textRecord);

        // eslint-disable-next-line max-len
        //If the profile string contains all 3 mandatory fields, and the according signature the string can be considered valid
        return !!(publicEncryptionKey && publicSigningKey && url);
    } catch (e) {
        return false;
    }
}

async function resolveProfile(textRecord: string) {
    log(`[getUserProfile] Resolve Json profile `);

    const {
        publicEncryptionKey,
        publicSigningKey,
        url,
    }: Partial<DeliveryServiceProfile> = JSON.parse(textRecord);

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
