import { ProfileKeys } from '../../account';
import { createProfileKeys } from '../../account/profileKeys/createProfileKeys';
import { createStorageKey, getStorageKeyCreationMessage } from '../../crypto';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';
import { Connection } from '../../web3-provider/Web3Provider';

export async function createKeyPairsFromSig(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    nonce: number,
): Promise<ProfileKeys> {
    const { provider, account } = connection;

    if (!provider) {
        throw Error('createKeyPairsFromSig: no provider');
    }

    if (!account) {
        throw Error('createKeyPairsFromSig: no account');
    }

    const storageKeyCreationMessage = getStorageKeyCreationMessage(nonce);

    const signature = await personalSign(
        provider,
        account.address,
        storageKeyCreationMessage,
    );

    const storageKey = await createStorageKey(signature);

    return await createProfileKeys(storageKey, nonce);
}
