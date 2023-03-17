import { ProfileKeys } from '../account/src';
import { load } from '../storage';
import { ConnectionState } from '../web3-provider';

export async function getSessionFromStorage(
    storageFile: string,
    keys: ProfileKeys,
) {
    const externalData = await load(
        JSON.parse(storageFile),
        keys.storageEncryptionKey,
    );

    return {
        connectionState: ConnectionState.SignedIn,
        db: {
            ...externalData,
        },
    };
}
