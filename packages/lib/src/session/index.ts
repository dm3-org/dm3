import { getUserProfile, ProfileKeys } from '../account';
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
import { createKeyPairsFromSig as execCreateKeyPairsFromSig } from './SignIn/signProfileKeyPair';

export { getSessionFromStorage } from './getSessionFromStorage';

export function connectAccount(connection: Connection, preSetAccount?: string) {
    return execConnectAccount(
        connection,
        requestAccounts,
        getUserProfile,
        preSetAccount,
    );
}

export async function reAuth(
    connection: Connection,
    privateSigningKey: string,
) {
    return execReAuth(connection, getChallenge, getNewToken, privateSigningKey);
}

export async function signIn(connection: Partial<Connection>) {
    return execSignIn(connection, prersonalSign, submitUserProfile);
}

export async function createKeyPairsFromSig(
    connection: Partial<Connection>,
    nonce: number,
): Promise<ProfileKeys> {
    return execCreateKeyPairsFromSig(connection, prersonalSign, nonce);
}
