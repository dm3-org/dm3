import { load } from 'dm3-lib-storage';
import { ProfileKeys } from 'dm3-lib-profile';
import { ConnectionState } from '../web3provider/Web3Provider';

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
