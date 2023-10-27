import { ProfileKeys } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { getLspFromResolver } from './api/getLspFromResolver';
import { createLspFromDappSig } from './create/createLinkProfileFromDappSig';
import { recoverLinkProfile } from './create/recoverLinkProfile';

export const createLspMessage = (owner: string) => `creating LSP for ${owner}`;
export const lspLinkMessage = (owner: string, lsp: string) =>
    `Linking LSP ${lsp} to ${owner}`;
export const lspLinkAcceptMessage = (owner: string, lsp: string) =>
    `Accept Linking LSP ${lsp} to ${owner}`;

export interface LimitedScopeProfile {
    ensName: string;
    privateKey: string;
    nonce: string;
    keys: ProfileKeys;
}
export async function loginWithDapp(
    web3Provider: ethers.providers.JsonRpcProvider,
    offchainResolverUrl: string,
    deliveryServiceEnsName: string,
    appId: string,
    ownerAddr: string,
    authMessage: string,
    sig: string,
): Promise<LimitedScopeProfile> {
    //Ask offchain resolver if the user has an LSP

    const existingLsp = await getLspFromResolver(
        offchainResolverUrl,
        appId,
        ownerAddr,
        authMessage,
        sig,
    );

    //user has created lsp already. Use their privateKey and nonce to create a LSP object
    if (existingLsp) {
        return await recoverLinkProfile(
            web3Provider,
            appId,
            ownerAddr,
            existingLsp.privateKey,
            existingLsp.nonce,
        );
    }

    //user doesn't have an LSP. Create one for them
    return await createLspFromDappSig(
        web3Provider,
        offchainResolverUrl,
        deliveryServiceEnsName,
        appId,
        ownerAddr,
        authMessage,
        sig,
    );
}
