import { createStorageKey, getStorageKeyCreationMessage } from 'dm3-lib-crypto';
import { ProfileKeys, createProfileKeys } from 'dm3-lib-profile';
import { Connection } from '../../web3provider/Web3Provider';
import { ethersHelper } from 'dm3-lib-shared';

export async function createKeyPairsFromSig(
    connection: Partial<Connection>,
    personalSign: ethersHelper.PersonalSign,
    nonce: string,
): Promise<ProfileKeys> {
    const { provider, ethAddress } = connection;

    if (!provider) {
        throw Error('createKeyPairsFromSig: no provider');
    }

    if (!ethAddress) {
        throw Error('No eth address');
    }

    const storageKeyCreationMessage = getStorageKeyCreationMessage(
        nonce,
        ethAddress,
    );

    const signature = await personalSign(
        provider,
        ethAddress,
        storageKeyCreationMessage,
    );

    const storageKey = await createStorageKey(signature);

    return await createProfileKeys(storageKey, nonce);
}
