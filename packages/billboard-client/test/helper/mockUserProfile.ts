import { createStorageKey, getStorageKeyCreationMessage } from 'dm3-lib-crypto';
import {
    Account,
    SignedUserProfile,
    UserProfile,
    createProfileKeys,
    getProfileCreationMessage,
} from 'dm3-lib-profile';
import { stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';

export const mockUserProfile = async (
    wallet: ethers.Wallet,
    ensName: string,
    deliveryServices: string[],
): Promise<{
    address: string;
    signedUserProfile: SignedUserProfile;
    account: Account;
    wallet: ethers.Wallet;
    stringified: string;
}> => {
    const storageKeyCreationMessage = getStorageKeyCreationMessage(0);

    const storageKeySig = await wallet.signMessage(storageKeyCreationMessage);

    const storageKey = await createStorageKey(storageKeySig);
    const profileKeys = await createProfileKeys(storageKey, 0);

    const profile: UserProfile = {
        publicSigningKey: profileKeys.signingKeyPair.publicKey,
        publicEncryptionKey: profileKeys.encryptionKeyPair.publicKey,
        deliveryServices,
    };
    const createUserProfileMessage = getProfileCreationMessage(
        stringify(profile),
    );
    const userProfileSig = await wallet.signMessage(createUserProfileMessage);

    return {
        wallet,
        address: wallet.address,
        account: {
            ensName,
            profile,
            profileSignature: userProfileSig,
        },
        signedUserProfile: {
            profile,
            signature: userProfileSig,
        },
        stringified:
            'data:application/json,' +
            JSON.stringify({
                profile,
                signature: userProfileSig,
            }),
    };
};
