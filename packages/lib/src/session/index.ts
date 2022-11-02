import { createKeys } from '../account/Account';
import { getSymmetricalKeyFromSignature } from '../encryption/SymmetricalEncryption';
import {
    getChallenge,
    getNewToken,
    submitUserProfile,
} from '../external-apis/BackendAPI';
import {
    prersonalSign,
    requestAccounts,
} from '../external-apis/InjectedWeb3API';
import { UserDB, UserStorage } from '../storage';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import { signIn as execSignIn, reAuth as execReAuth } from './SignIn';
import { connectAccount as execConnectAccount } from './Connect';
import { getUserProfile } from '../account';

export async function signIn(
    connection: Partial<Connection>,
    browserDataFile: UserStorage | undefined,
    externalDataFile: string | undefined,
    overwriteUserDb: Partial<UserDB>,
    preLoadedKey?: string,
): Promise<{
    connectionState: ConnectionState;
    db?: UserDB;
}> {
    return execSignIn(
        connection,
        prersonalSign,
        submitUserProfile,
        createKeys,
        getSymmetricalKeyFromSignature,
        browserDataFile,
        externalDataFile,
        overwriteUserDb,
        preLoadedKey,
    );
}

export function connectAccount(connection: Connection, preSetAccount?: string) {
    return execConnectAccount(
        connection,
        requestAccounts,
        getUserProfile,
        preSetAccount,
    );
}
export async function reAuth(connection: Connection) {
    return execReAuth(connection, getChallenge, getNewToken, prersonalSign);
}
