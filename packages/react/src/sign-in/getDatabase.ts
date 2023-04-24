import { Actions } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { GlobalState } from '../reducers/shared';
import { getStorageFile } from './getStorageFile';
import {
    createKeyPairsFromSig,
    getSessionFromStorage,
    reAuth,
    signIn,
} from '../session';
import { StorageLocation, UserDB } from 'dm3-lib-storage';
import { Account } from 'dm3-lib-profile';
import { ConnectionState } from '../web3provider/Web3Provider';

export async function getDatabase(
    profileExists: boolean,
    storageLocation: StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
    account?: Account;
}> {
    return profileExists
        ? getExistingDatebase(storageLocation, storageToken, state, dispatch)
        : createNewDatabase(state);
}

async function getExistingDatebase(
    storageLocation: StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) {
    const keys = await createKeyPairsFromSig(state.connection, 0);

    const deliveryServiceToken = await reAuth(
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
            payload: ConnectionState.SignInFailed,
        });
        throw 'Sign in failed';
    }
    //The encrypted session file will now be decrypted, therefore the user has to sign the auth message again.
    const { db, connectionState } = await getSessionFromStorage(
        storageFile,
        keys,
    );

    return { deliveryServiceToken, db, connectionState };
}

async function createNewDatabase(state: GlobalState): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
    account: Account;
}> {
    const signInData = await signIn(state.connection);
    return signInData;
}
