/* eslint-disable no-console */
import {
    DEFAULT_NONCE,
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
    getProfileCreationMessage,
} from 'dm3-lib-profile';

import {
    createStorageKey,
    getStorageKeyCreationMessage,
    sign,
} from 'dm3-lib-crypto';
import { UserDB, createDB, getDm3Storage, load } from 'dm3-lib-storage';

import { GetWalletClientResult } from '@wagmi/core';
import {
    getChallenge,
    getNewToken,
    submitUserProfile,
} from 'dm3-lib-delivery-api';
import { claimAddress } from 'dm3-lib-offchain-resolver-api';
import { createProfileKeys as _createProfileKeys } from 'dm3-lib-profile';
import { globalConfig, stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import axios from 'axios';

type ConnectDsResult = {
    userDb: UserDB;
    signedUserProfile: SignedUserProfile;
    deliveryServiceToken: string;
};

export const DeliveryServiceConnector = (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    walletClient: GetWalletClientResult,
    address: string,
) => {
    async function createProfileKeys(
        nonce: string = DEFAULT_NONCE,
    ): Promise<ProfileKeys> {
        if (!walletClient) {
            throw Error('No wallet client');
        }

        if (!address) {
            throw Error('No eth address');
        }

        const storageKeyCreationMessage = getStorageKeyCreationMessage(
            nonce,
            address,
        );

        //@ts-ignore
        const signature = await walletClient.signMessage({
            message: storageKeyCreationMessage,
        });

        const storageKey = await createStorageKey(signature);
        return await _createProfileKeys(storageKey, nonce);
    }
    async function profileExistsOnDeliveryService(ensName: string) {
        //TODO move default url to global config
        const url = `${process.env.REACT_APP_DEFAULT_SERVICE}/profile/${ensName}`;
        try {
            const { status } = await axios.get(url);
            return status === 200;
        } catch (err) {
            return false;
        }
    }
    const loginWithNewProfile = async (): Promise<ConnectDsResult> => {
        const createNewSignedUserProfile = async ({
            signingKeyPair,
            encryptionKeyPair,
        }: ProfileKeys) => {
            const profile: UserProfile = {
                publicSigningKey: signingKeyPair.publicKey,
                publicEncryptionKey: encryptionKeyPair.publicKey,
                deliveryServices: [globalConfig.DEFAULT_DELIVERY_SERVICE()],
            };
            try {
                const profileCreationMessage = getProfileCreationMessage(
                    stringify(profile),
                    address!,
                );

                //@ts-ignore
                const sig = await walletClient.signMessage({
                    message: profileCreationMessage,
                });

                return {
                    profile,
                    signature: sig,
                } as SignedUserProfile;
            } catch (error: any) {
                const err = error?.message.split(':');
                throw Error(err.length > 1 ? err[1] : err[0]);
            }
        };
        const keys = await createProfileKeys();

        const signedUserProfile = await createNewSignedUserProfile(keys);
        if (
            !(await claimAddress(
                address!,
                process.env.REACT_APP_RESOLVER_BACKEND as string,
                signedUserProfile,
            ))
        ) {
            throw Error(`Couldn't claim address subdomain`);
        }
        const ensName = address + globalConfig.ADDR_ENS_SUBDOMAIN();

        const deliveryServiceToken = await submitUserProfile(
            { ensName, profile: signedUserProfile.profile },
            mainnetProvider,
            signedUserProfile,
        );
        const userDb = createDB(keys);
        return {
            userDb,
            deliveryServiceToken,
            signedUserProfile,
        };
    };

    const loginWithExistingProfile = async (
        ensName: string,
        signedUserProfile: SignedUserProfile,
    ): Promise<ConnectDsResult> => {
        const reAuth = async (
            ensName: string,
            profile: UserProfile,
            privateSigningKey: string,
        ) => {
            const challenge = await getChallenge(
                { profile, ensName },
                mainnetProvider,
            );

            const signature = await sign(privateSigningKey, challenge);
            return getNewToken(
                { profile, ensName },
                mainnetProvider,
                signature,
            );
        };
        const keys = await createProfileKeys();
        const deliveryServiceToken = await reAuth(
            ensName,
            signedUserProfile.profile,
            keys.signingKeyPair.privateKey,
        );

        const storageFile = await getDm3Storage(
            mainnetProvider,
            { profile: signedUserProfile.profile, ensName },
            deliveryServiceToken,
        );

        if (!storageFile) {
            throw Error('No storage file');
        }

        //The encrypted session file will now be decrypted, therefore the user has to sign the auth message again.
        const userDb = await load(
            JSON.parse(storageFile),
            keys.storageEncryptionKey,
        );

        return {
            userDb,
            deliveryServiceToken,
            signedUserProfile,
        };
    };

    const login = async (
        ensName: string,
        signedUserProfile?: SignedUserProfile,
    ) => {
        const userHasProfile = !!signedUserProfile;
        const dsKnowsUser = await profileExistsOnDeliveryService(ensName);

        const profileExists = userHasProfile && dsKnowsUser;

        return profileExists
            ? await loginWithExistingProfile(ensName, signedUserProfile)
            : await loginWithNewProfile();
    };

    return { login };
};
