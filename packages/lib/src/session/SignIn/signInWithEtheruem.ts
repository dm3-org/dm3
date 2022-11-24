import { getStorageKeyCreationMessage } from '../../crypto';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';

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
        version: '1',
        chainId: 1,
    });

    return siweMessage.prepareMessage();
}

function getNonce() {
    return DEFAULT_NONCE;
}

export async function signInWithEthereum(
    provider: ethers.providers.JsonRpcProvider,
    personalSign: PersonalSign,
    account: string,
) {
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

        return { siwaMessage, nonce };
    } catch (e) {
        throw Error("Can't signIn with Etheruem");
    }
}
