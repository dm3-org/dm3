import { getUserProfile } from '../account';
import {
    getChallenge,
    getNewToken,
    submitUserProfile,
} from '../external-apis/BackendAPI';
import {
    prersonalSign,
    requestAccounts,
} from '../external-apis/InjectedWeb3API';
import { Connection } from '../web3-provider/Web3Provider';
import { connectAccount as execConnectAccount } from './Connect';

import { reAuth as execReAuth } from './reAuth';

import { signIn as execSignIn } from './SignIn/signIn';
import { getSessionFromStorage as execGetSessionFromStroage } from './getSessionFromStorage';

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

export async function signIn(connection: Partial<Connection>) {
    return execSignIn(connection, prersonalSign, submitUserProfile);
}
export async function getSessionFromStorage(
    connection: Partial<Connection>,
    storageFile: string,
) {
    return execGetSessionFromStroage(connection, prersonalSign, storageFile);
}
