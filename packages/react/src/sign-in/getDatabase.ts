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
    const deliveryServiceToken = await Lib.session.reAuth(state.connection);

    const storageFile = await getStorageFile(
        storageLocation,
        storageToken!,
        deliveryServiceToken,
        state.connection,
    );

    //No access to data -> Sign in fails
    if (!storageFile) {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.web3provider.ConnectionState.SignInFailed,
        });
        throw 'Sign in failed';
    }

    const { db, connectionState } = await Lib.session.getSessionFromStorage(
        state.connection,
        storageFile,
    );

    return { deliveryServiceToken, db, connectionState };
}

async function createNewDatabase(state: GlobalState) {
    return await Lib.session.initialSignIn(state.connection);
}
