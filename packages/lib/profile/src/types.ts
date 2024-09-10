import { KeyPair } from '@dm3-org/dm3-lib-crypto';

export interface DeliveryServiceProfile {
    publicSigningKey: string;
    publicEncryptionKey: string;
    url: string;
}

export interface UserProfile {
    publicEncryptionKey: string;
    publicSigningKey: string;
    deliveryServices: string[];
}

export interface SignedUserProfile {
    profile: UserProfile;
    signature: string;
}

export interface DeliveryServiceProfileKeys {
    encryptionKeyPair: KeyPair;
    signingKeyPair: KeyPair;
}
