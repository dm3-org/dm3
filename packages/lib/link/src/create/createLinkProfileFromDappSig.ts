import { ethers } from 'ethers';
import { createLinkProfile } from './createLinkProfile';

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
    const lsp = await createLinkProfile(
        web3Provider,
        offchainResolverUrl,
        deliveryServiceEnsName,
        appID,
        authMessage,
        ownerAddress,
        sig,
        entropy,
    );

    return lsp;
}
