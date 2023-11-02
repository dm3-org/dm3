/* eslint-disable no-console */
import { Command, program } from 'commander';
import { getStorageKeyCreationMessage, createStorageKey } from 'dm3-lib-crypto';
import { createProfileKeys, UserProfile } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { getSanitizedWallet } from '../sanitizer/getSanitizedWallet';

const newProfile = async (program: Command) => {
    const { profilePk, deliveryService } = program.opts();
    if (!deliveryService) {
        program.error(
            'error: option --deliveryService <deliveryService> argument missing',
        );
    }
    const storageKeyCreationMessage = getStorageKeyCreationMessage(
        '0xca8f04fdc80d659997f69b02',
    );

    const profileWallet = getSanitizedWallet(
        program,
        profilePk ?? ethers.Wallet.createRandom().privateKey,
        'profilePk',
    );

    const storageKeySig = await profileWallet.signMessage(
        storageKeyCreationMessage,
    );

    const storageKey = await createStorageKey(storageKeySig);
    const profileKeys = await createProfileKeys(
        storageKey,
        '0xca8f04fdc80d659997f69b02',
    );

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

    console.log(profile);
};

export { newProfile };
