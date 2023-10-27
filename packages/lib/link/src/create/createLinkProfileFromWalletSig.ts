import { ethers } from 'ethers';
import { createLspMessage } from '..';
import { createLinkProfile } from './createLinkProfile';

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

    const lsp = await createLinkProfile(
        web3Provider,
        offchainResolverUrl,
        deliveryServiceEnsName,
        appID,
        createLspMessage(ownerAddress),
        ownerAddress,
        sig,
    );
    return lsp;
}
