import {
    createKeyPair,
    createSigningKeyPair,
    createStorageKey,
    getStorageKeyCreationMessage,
} from '../crypto';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { ProfileKeys } from '../account';

const DEFAULT_NONCE = 0;

function createSignInWithEthereumMessage(account: string, nonce: number) {
    const statement = getStorageKeyCreationMessage(nonce);
    //Create an messgage as defined at EIP-4361
    const siweMessage = new SiweMessage({
        //Get domain from widget i guess
        domain: 'www.dm3.chat',
        address: account,
        statement,
        uri: 'origin',
        nonce: nonce.toString(),
        version: '1',
        chainId: 1,
        issuedAt: new Date(12).getTime().toString(),
    });

    return siweMessage.prepareMessage();
}

function getNonce() {
    return DEFAULT_NONCE;
}

export async function createKeys(
    nonceMsgSig: string,
    nonce: number,
): Promise<ProfileKeys> {
    return {
        encryptionKeyPair: await createKeyPair(nonceMsgSig),
        signingKeyPair: await createSigningKeyPair(nonceMsgSig),
        storageEncryptionKey: nonceMsgSig,
        storageEncryptionNonce: nonce,
    };
}

export async function signInWithEthereum(
    provider: ethers.providers.JsonRpcProvider,
    personalSign: PersonalSign,
    account: string,
): Promise<ProfileKeys> {
    try {
        const nonce = getNonce();
        const unsignedSiwaMessage = createSignInWithEthereumMessage(
            account,
            DEFAULT_NONCE,
        );
        const siwaMessage = await personalSign(
            provider,
            account,
            unsignedSiwaMessage,
        );

        return await createKeys(await createStorageKey(siwaMessage), nonce);
    } catch (e) {
        console.log(e);
        throw Error("Can't signIn with Ethereum");
    }
}
