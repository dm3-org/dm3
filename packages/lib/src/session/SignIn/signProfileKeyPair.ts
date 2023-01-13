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

    const address = await connection.provider?.resolveName(account.ensName);

    if (!address) {
        throw Error(`Couldn't resolve ENS name to eth address`);
    }

    const signature = await personalSign(
        provider,
        address,
        storageKeyCreationMessage,
    );

    const storageKey = await createStorageKey(signature);

    return await createProfileKeys(storageKey, nonce);
}
