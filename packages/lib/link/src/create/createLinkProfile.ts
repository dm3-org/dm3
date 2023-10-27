import { getDeliveryServiceProfile, createProfile } from 'dm3-lib-profile';
import { ethersHelper } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { LimitedScopeProfile } from '..';
import { claimAddress } from '../api/claimAddress';
import { claimSubdomainForLsp } from '../api/claimSubdomainForLsp';
import { submitUserProfile } from '../api/claimUserProfile';

export async function createLinkProfile(
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
    };

    //Keep the KeyPair we just generated in the local storage so we can use them later

    return newHotWallet;
}
