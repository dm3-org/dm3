import { UserProfile } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';

//Struct that represents a Dm3 key store
export interface Dm3KeyStore {
    [signerAddress: string]: {
        encryptedProfileKeys: string;
        signerPublicKey: string;
    };
}

export interface IKeyStoreService {
    //Method to publish the Dm3 user profile. Ideally this should be ENS or any other place that can be access using a resolver
    writeDm3Profile(userProfile: UserProfile): Promise<void>;
    //Method to publish the Dm3 key store. Ideally this should be ENS or any other place that can be access using a resolver
    writeDm3KeyStore(keyStore: Dm3KeyStore): Promise<void>;

    //Convenience method to support batch calls
    writeDm3KeyStoreAndUserProfile(
        keyStore: Dm3KeyStore,
        userProfile: UserProfile,
    ): Promise<void>;

    readDm3Profile(): Promise<UserProfile>;
    readDm3KeyStore(): Promise<Dm3KeyStore>;
}
