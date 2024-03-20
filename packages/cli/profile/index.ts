/* eslint-disable no-console */
import { Command, program } from 'commander';
import {
    getStorageKeyCreationMessage,
    createStorageKey,
} from '@dm3-org/dm3-lib-crypto';
import {
    createProfileKeys,
    getProfileCreationMessage,
    SignedUserProfile,
    UserProfile,
    DEFAULT_NONCE,
} from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { getSanitizedWallet } from '../sanitizer/getSanitizedWallet';
import { stringify } from '@dm3-org/dm3-lib-shared';

const newProfile = async (program: Command) => {
    const { profilePk, deliveryService } = program.opts();
    if (!deliveryService) {
        program.error(
            'error: option --deliveryService <deliveryService> argument missing',
        );
    }

    const profileWallet = getSanitizedWallet(
        program,
        profilePk ?? ethers.Wallet.createRandom().privateKey,
        'profilePk',
    );
    const storageKeyCreationMessage = getStorageKeyCreationMessage(
        DEFAULT_NONCE,
        profileWallet.address,
    );

    const storageKeySig = await profileWallet.signMessage(
        storageKeyCreationMessage,
    );

    const storageKey = await createStorageKey(storageKeySig);
    const profileKeys = await createProfileKeys(storageKey, DEFAULT_NONCE);

    const profile: UserProfile = {
        publicSigningKey: profileKeys.signingKeyPair.publicKey,
        publicEncryptionKey: profileKeys.encryptionKeyPair.publicKey,
        deliveryServices: [deliveryService],
    };
    if (profilePk) {
        console.log(
            `Created new profile based on provided profilePk : ${profilePk}`,
        );
    } else {
        console.log(
            `Created new profile based on random profilePk : ${profileWallet.privateKey}`,
        );
    }

    const profileCreationMessage = getProfileCreationMessage(
        stringify(profile),
        profileWallet.address,
    );

    const profileSig = await profileWallet.signMessage(profileCreationMessage);
    const signedProfile: SignedUserProfile = { profile, signature: profileSig };

    console.log(signedProfile);
};

export { newProfile };
