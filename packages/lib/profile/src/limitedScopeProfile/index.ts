import { ethers } from 'ethers';
import { ProfileKeys, createProfile, normalizeEnsName } from '../Profile';
import {
    getDeliveryServiceClient,
    getDeliveryServiceProfile,
} from '../deliveryServiceProfile/Delivery';
import { SignedUserProfile } from '../types';
import axios from 'axios';

export type StoreLsp = (lsp: LimitedScopeProfile) => Promise<void>;

export function createLspFromRandomWallet(
    web3Provider: ethers.providers.JsonRpcProvider,
    storeLsp: StoreLsp,
    offchainResolverUrl: string,
    deliveryServiceEnsName: string,
    appID: string,
    entropy?: string,
) {
    const wallet = ethers.Wallet.createRandom({
        extraEntropy: entropy,
    });
    return createLsp(
        web3Provider,
        storeLsp,
        offchainResolverUrl,
        deliveryServiceEnsName,
        wallet,
        appID,
    );
}

export interface LimitedScopeProfile {
    ensName: string;
    keys: ProfileKeys;
    token: string;
    deliveryServiceUrl: string;
}

export async function createLsp(
    web3Provider: ethers.providers.JsonRpcProvider,
    storeLsp: StoreLsp,
    offchainResolverUrl: string,
    deliveryServiceEnsName: string,
    wallet: ethers.Wallet,
    appID: string,
) {
    const deliverServiceProfile = await getDeliveryServiceProfile(
        deliveryServiceEnsName,
        web3Provider,
        //For now just JSON profiles hosted on ENS are supported.
        //Hence we're not implementing the GetResource here
        () => Promise.resolve(undefined),
    );
    if (!deliverServiceProfile) {
        throw (
            "Can't get delivery service profile for " + deliveryServiceEnsName
        );
    }

    const profile = await createProfile(
        wallet.address,
        [deliveryServiceEnsName],
        //provider is not used when a signer is used for signing
        undefined!,
        {
            signer: (msg: string) => wallet.signMessage(msg),
        },
    );
    const { keys, signedProfile } = profile;

    //Before we can claim a subdomain we've to claim an address first
    await claimAddress(wallet.address, offchainResolverUrl, signedProfile);

    const ensName = `${wallet.address}.${appID}.dm3.eth`;

    //Finally we've to submmit the profile to the deliveryService
    const token = await submitUserProfile(
        web3Provider,
        deliverServiceProfile.url,
        ensName,
        profile.signedProfile,
    );

    if (!token) {
        throw new Error(
            'Failed to submit user profile to the delivery service',
        );
    }
    const newHotWallet: LimitedScopeProfile = {
        ensName,
        keys,
        token,
        deliveryServiceUrl: deliverServiceProfile.url,
    };

    await storeLsp(newHotWallet);
    //Keep the KeyPair we just generated in the local storage so we can use them later

    return newHotWallet;
}

const RANDOM_HOTWALLET_KEY = 'DM3-Limited-Scope-Key';

export const getLocalStorageIdentifier = (address: string, appId: string) => {
    return `${RANDOM_HOTWALLET_KEY}-${appId}-${address}`;
};

async function submitUserProfile(
    web3Provider: ethers.providers.JsonRpcProvider,
    baseUrl: string,
    ensName: string,
    signedUserProfile: SignedUserProfile,
) {
    const url = `${baseUrl}/profile/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        signedUserProfile.profile,
        web3Provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, signedUserProfile);

    return data;
}

export async function claimAddress(
    address: string,
    offchainResolverUrl: string,
    signedUserProfile: SignedUserProfile,
) {
    const url = `${offchainResolverUrl}/profile/address`;
    const data = {
        signedUserProfile,
        address,
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}
