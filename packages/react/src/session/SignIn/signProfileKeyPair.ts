import * as Lib from 'dm3-lib';
export async function createKeyPairsFromSig(
    connection: Partial<Lib.Connection>,
    personalSign: Lib.shared.ethersHelper.PersonalSign,
    nonce: number,
): Promise<Lib.profile.ProfileKeys> {
    const { provider, ethAddress } = connection;

    if (!provider) {
        throw Error('createKeyPairsFromSig: no provider');
    }

    if (!ethAddress) {
        throw Error('No eth address');
    }

    const storageKeyCreationMessage =
        Lib.crypto.getStorageKeyCreationMessage(nonce);

    const signature = await personalSign(
        provider,
        ethAddress,
        storageKeyCreationMessage,
    );

    const storageKey = await Lib.crypto.createStorageKey(signature);

    return await Lib.profile.createProfileKeys(storageKey, nonce);
}
