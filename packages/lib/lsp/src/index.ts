import {
    ProfileKeys,
    createProfile,
    getDeliveryServiceClient,
    getDeliveryServiceProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { ethers } from 'ethers';

import axios from 'axios';
import { sign } from 'dm3-lib-crypto';
import { SignedUserProfile } from 'dm3-lib-profile';
import { stringify } from 'dm3-lib-shared';

import {
    EncryptionEnvelop,
    createEnvelop,
    createJsonRpcCallSubmitMessage,
} from 'dm3-lib-messaging';
import { ethersHelper } from 'dm3-lib-shared';

export type StoreLsp = (lsp: LimitedScopeProfile) => Promise<void>;

export const createLspMessage = (owner: string) => `creating LSP for ${owner}`;

export async function createLspFromDappSig(
    web3Provider: ethers.providers.JsonRpcProvider,
    offchainResolverUrl: string,
    deliveryServiceEnsName: string,
    appID: string,
    ownerAddress: string,
    authMessage: string,
    sig: string,
    entropy?: string,
) {
    const lsp = await createLsp(
        web3Provider,
        offchainResolverUrl,
        deliveryServiceEnsName,
        appID,
        authMessage,
        ownerAddress,
        sig,
        entropy,
    );

    return { lsp };
}

export async function createLspFromWalletSig(
    web3Provider: ethers.providers.JsonRpcProvider,
    offchainResolverUrl: string,
    deliveryServiceEnsName: string,
    appID: string,
    ownerAddress: string,
    entropy?: string,
) {
    const sig = await web3Provider.send('personal_sign', [
        createLspMessage(ownerAddress),
        ownerAddress,
    ]);

    const lsp = await createLsp(
        web3Provider,
        offchainResolverUrl,
        deliveryServiceEnsName,
        appID,
        createLspMessage(ownerAddress),
        ownerAddress,
        sig,
    );
    return { lsp };
}

export interface LimitedScopeProfile {
    ensName: string;
    privateKey: string;
    nonce: string;
    keys: ProfileKeys;
    token: string;
    deliveryServiceUrl: string;
}

export async function createLsp(
    web3Provider: ethers.providers.JsonRpcProvider,
    offchainResolverUrl: string,
    deliveryServiceEnsName: string,
    appID: string,
    authMessage: string,
    ownerAddress: string,
    authSig: string,
    entropy?: string,
) {
    const lspWallet = ethers.Wallet.createRandom({
        extraEntropy: entropy,
    });
    //We've to ensure that the creating of the LSP is intended by the owner¸
    const sigIsValid = await ethersHelper.checkSignature(
        authMessage,
        ownerAddress,
        authSig,
    );

    if (!sigIsValid) {
        throw new Error(
            'Invalid signature, auth message was not signed by owner',
        );
    }

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
        ownerAddress,
        [deliveryServiceEnsName],
        //provider is not used when a signer is used for signing
        undefined!,
        {
            signer: (msg: string) => lspWallet.signMessage(msg),
        },
    );
    const { keys, signedProfile, nonce } = profile;

    //Before we can claim a subdomain we've to claim an address first
    await claimAddress(lspWallet.address, offchainResolverUrl, signedProfile);
    //TBD figure out how to claim subdomain
    await claimSubdomainForLsp(
        offchainResolverUrl,
        signedProfile,
        authMessage,
        authSig,
        lspWallet.address,
    );

    const ensName = `lsp.${ownerAddress}.${appID}.dm3.eth`;

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
        privateKey: lspWallet.privateKey,
        nonce,
        token,
        deliveryServiceUrl: deliverServiceProfile.url,
    };

    //Keep the KeyPair we just generated in the local storage so we can use them later

    return newHotWallet;
}

export async function linkLsp(
    web3Provider: ethers.providers.JsonRpcProvider,
    deliveryServiceUrl: string,
    deliveryServiceToken: string,
    ownerAddr: string,
    lspAddr: string,
    lspProfileKeys: ProfileKeys,
) {
    const msg = await createLinkMessage(
        ownerAddr,
        lspAddr,
        'TBD add message payload',
        lspProfileKeys.signingKeyPair.privateKey,
    );
    const { encryptedEnvelop: envelop, sendDependencies } = await createEnvelop(
        msg,
        web3Provider,
        lspProfileKeys,
        (url: string) => axios.get(url),
    );
    await submitMessage(deliveryServiceUrl, envelop, deliveryServiceToken);
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

    const result = await getDeliveryServiceClient(
        signedUserProfile.profile,
        web3Provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, signedUserProfile);

    return result.data;
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
async function claimSubdomainForLsp(
    offchainResolverUrl: string,
    signedUserProfile: SignedUserProfile,
    authMessage: string,
    authSig: string,
    hotAddr: string,
): Promise<boolean> {
    const url = `${offchainResolverUrl}/profile/nameLsp`;
    const data = {
        signedUserProfile,
        authMessage,
        authSig,
        hotAddr,
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}

async function createLinkMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
): Promise<any> {
    const messgeWithoutSig = {
        message,
        attachments: [],
        metadata: {
            type: 'LINK',
            to,
            from,
            timestamp: new Date().getTime(),
        },
    };
    return {
        ...messgeWithoutSig,
        signature: await sign(privateKey, stringify(messgeWithoutSig)),
    };
}

function submitMessage(url: string, envelop: EncryptionEnvelop, token: string) {
    const req = createJsonRpcCallSubmitMessage(envelop, token);
    return axios.post(`/rpc`, req, { baseURL: url });
}
