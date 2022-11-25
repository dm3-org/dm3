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

import { initialSignIn as execInitialSignIn } from './initialSignIn';
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

export async function initialSignIn(connection: Partial<Connection>) {
    return execInitialSignIn(connection, prersonalSign, submitUserProfile);
}
export async function getSessionFromStorage(
    connection: Partial<Connection>,
    storageFile: string,
) {
    return execGetSessionFromStroage(connection, prersonalSign, storageFile);
}
