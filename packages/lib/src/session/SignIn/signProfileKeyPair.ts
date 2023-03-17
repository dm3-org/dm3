import { ProfileKeys } from '../../account/src';
import { createProfileKeys } from '../../account/src/profileKeys/createProfileKeys';
import {
    createStorageKey,
    getStorageKeyCreationMessage,
} from '../../crypto/src';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';
import { Connection } from '../../web3-provider/Web3Provider';

export async function createKeyPairsFromSig(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    nonce: number,
): Promise<ProfileKeys> {
    const { provider, ethAddress } = connection;

    if (!provider) {
        throw Error('createKeyPairsFromSig: no provider');
    }

    if (!ethAddress) {
        throw Error('No eth address');
    }

    const storageKeyCreationMessage = getStorageKeyCreationMessage(nonce);

    const signature = await personalSign(
        provider,
        ethAddress,
        storageKeyCreationMessage,
    );

    const storageKey = await createStorageKey(signature);

    return await createProfileKeys(storageKey, nonce);
}
