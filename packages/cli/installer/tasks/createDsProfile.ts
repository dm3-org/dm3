import {
    DeliveryServiceProfile,
    DeliveryServiceProfileKeys,
} from 'dm3-lib-profile';
import { InstallerArgs } from '../types';
import {
    createKeyPair,
    createSigningKeyPair,
    createStorageKey,
} from 'dm3-lib-crypto';
import { logInfo } from 'dm3-lib-shared';

export const createDsProfile = async (args: InstallerArgs) => {
    const keys: DeliveryServiceProfileKeys = {
        encryptionKeyPair: await createKeyPair(
            await createStorageKey(args.profileWallet.privateKey),
        ),
        signingKeyPair: await createSigningKeyPair(
            await createStorageKey(args.profileWallet.privateKey),
        ),
    };
    //TODO create ds profile
    const profile: DeliveryServiceProfile = {
        publicEncryptionKey: keys.encryptionKeyPair.publicKey,
        publicSigningKey: keys.signingKeyPair.publicKey,
        url: args.deliveryService,
    };

    logInfo('Create DeliveryServiceProfile:');
    logInfo(profile);

    return profile;
};
