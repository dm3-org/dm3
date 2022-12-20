import { Actions } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { GlobalState } from '../reducers/shared';
import { getStorageFile } from './getStorageFile';
import * as Lib from 'dm3-lib';

export async function getDatabase(
    profileExists: boolean,
    storageLocation: Lib.storage.StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) {
    return profileExists
        ? getExistingDatebase(storageLocation, storageToken, state, dispatch)
        : createNewDatabase(state);
}

async function getExistingDatebase(
    storageLocation: Lib.storage.StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) {
    const keys = await Lib.session.createKeyPairsFromSig(state.connection, 0);

    const deliveryServiceToken = await Lib.session.reAuth(
        state.connection,
        keys.signingKeyPair.privateKey,
    );

    const storageFile = await getStorageFile(
        storageLocation,
        storageToken!,
        deliveryServiceToken,
        state.connection,
    );

    //If there is no storageFile despite the profile exists the login should fail
    if (!storageFile) {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.web3provider.ConnectionState.SignInFailed,
        });
        throw 'Sign in failed';
    }
    //The encrypted session file will now be decrypted, therefore the user has to sign the auth message again.
    const { db, connectionState } = await Lib.session.getSessionFromStorage(
        storageFile,
        keys,
    );

    return { deliveryServiceToken, db, connectionState };
}

async function createNewDatabase(state: GlobalState) {
    return await Lib.session.signIn(state.connection);
}
