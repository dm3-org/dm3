import { createKeyPairsFromSig, getUserProfile } from 'dm3-lib-profile';
import { ethers } from 'ethers';

export async function recoverLinkProfile(
    web3Provider: ethers.providers.JsonRpcProvider,
    appId: string,
    ownerAddr: string,
    privateKey: string,
    nonce: string,
) {
    const ensName = `lsp.${ownerAddr}.${appId}.dm3.eth`;

    const profile = await getUserProfile(web3Provider, ensName);

    if (!profile) {
        throw new Error(`No profile found for ${ensName}`);
    }

    const wallet = new ethers.Wallet(privateKey);
    //Todo figure out how to deal with token and deliveryServiceUrl
    const token = '';

    const profileKeys = await createKeyPairsFromSig(
        (msg: string) => wallet.signMessage(msg),
        nonce,
    );
    return {
        ensName,
        privateKey: privateKey,
        nonce: nonce,
        keys: profileKeys,
    };
}
