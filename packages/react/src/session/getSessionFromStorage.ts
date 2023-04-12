import * as Lib from 'dm3-lib';
import { ConnectionState } from '..';

export async function getSessionFromStorage(
    storageFile: string,
    keys: Lib.profile.ProfileKeys,
) {
    const externalData = await Lib.storage.load(
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
