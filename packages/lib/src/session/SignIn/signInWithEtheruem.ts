import { createStorageKey, getStorageKeyCreationMessage } from '../../crypto';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';
import { createKeys } from './SignIn';
import { ProfileKeys } from '../../account';

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

        console.log('SIWA MSG', siwaMessage);

        const sha = await createStorageKey(siwaMessage);
        console.log('sha', sha);
        return await createKeys(sha, nonce);
    } catch (e) {
        console.log(e);
        throw Error("Can't signIn with Etheruem");
    }
}

// eslint-disable-next-line max-len
//MSG 0x8aaae81b03d0d257fac700719ea873cae3f6b1c126c9a44d464f5187b611bee923025919ea5867986ddcefa124cdcae8639e5e5ee66c99a7da4a8d1cf1fe85871c

//SHA 0x085e95ce0777b1e3083125756aa36c6ce71d51da63d4a21c609493273db58a2c
