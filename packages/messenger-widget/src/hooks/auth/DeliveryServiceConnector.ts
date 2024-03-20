/* eslint-disable no-console */
import {
    DEFAULT_NONCE,
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
    getProfileCreationMessage,
} from '@dm3-org/dm3-lib-profile';

import {
    createStorageKey,
    getStorageKeyCreationMessage,
    sign,
} from '@dm3-org/dm3-lib-crypto';

import {
    getChallenge,
    getNewToken,
    submitUserProfile,
} from '@dm3-org/dm3-lib-delivery-api';
import { createProfileKeys as _createProfileKeys } from '@dm3-org/dm3-lib-profile';
import { globalConfig, stringify } from '@dm3-org/dm3-lib-shared';
import { GetWalletClientResult } from '@wagmi/core';
import axios from 'axios';
import { ethers } from 'ethers';
import { claimAddress } from '../../adapters/offchainResolverApi';
import { DM3Configuration } from '../../interfaces/config';

export type ConnectDsResult = {
    signedUserProfile: SignedUserProfile;
    deliveryServiceToken: string;
    profileKeys: ProfileKeys;
};

export const DeliveryServiceConnector = (
    dm3Configuration: DM3Configuration,
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

        //For what ever reason the wallet client is not typed
        //@ts-ignore
        const signature = await walletClient.signMessage({
            message: storageKeyCreationMessage,
        });

        const storageKey = await createStorageKey(signature);
        return await _createProfileKeys(storageKey, nonce);
    }
    async function profileExistsOnDeliveryService(ensName: string) {
        //TODO move default url to global config
        const url = `${dm3Configuration.defaultServiceUrl}/profile/${ensName}`;
        try {
            const { status } = await axios.get(url);
            return status === 200;
        } catch (err) {
            return false;
        }
    }

    const signUpWithExistingProfile = async (
        ensName: string,
        signedUserProfile: SignedUserProfile,
    ): Promise<ConnectDsResult> => {
        await claimAddress(
            address,
            dm3Configuration.resolverBackendUrl as string,
            signedUserProfile,
        );
        const deliveryServiceToken = await submitUserProfile(
            { ensName, profile: signedUserProfile.profile },
            mainnetProvider,
            signedUserProfile,
        );

        const keys = await createProfileKeys();

        return {
            profileKeys: keys,
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

        return {
            profileKeys: keys,
            deliveryServiceToken,
            signedUserProfile,
        };
    };
    const createNewProfileAndLogin = async (): Promise<ConnectDsResult> => {
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
                dm3Configuration.resolverBackendUrl as string,
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
        return {
            deliveryServiceToken,
            signedUserProfile,
            profileKeys: keys,
        };
    };

    const login = async (
        ensName: string,
        signedUserProfile?: SignedUserProfile,
    ) => {
        const userHasProfile = !!signedUserProfile;
        const dsKnowsUser = await profileExistsOnDeliveryService(ensName);

        const profileIsKnownToDs = userHasProfile && dsKnowsUser;

        //User has profile either onchain or at the resolver and has already sign up with the DS
        if (profileIsKnownToDs) {
            return await loginWithExistingProfile(ensName, signedUserProfile);
        }
        //User has profile onchain but not interacted with the DS yet
        if (userHasProfile) {
            return await signUpWithExistingProfile(ensName, signedUserProfile);
        }
        //User has neither an onchain profile nor a profile on the resolver
        return await createNewProfileAndLogin();
    };

    return { login };
};
