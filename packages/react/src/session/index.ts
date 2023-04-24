import {
    getChallenge,
    getNewToken,
    submitUserProfile,
} from 'dm3-lib-delivery-api';
import { reAuth as execReAuth } from './reAuth';
import { signIn as execSignIn } from './SignIn/signIn';
import { createKeyPairsFromSig as execCreateKeyPairsFromSig } from './SignIn/signProfileKeyPair';
import { ethersHelper } from 'dm3-lib-shared';
import { ProfileKeys } from 'dm3-lib-profile';
import { Connection } from '../web3provider/Web3Provider';

export { getSessionFromStorage } from './getSessionFromStorage';

export async function reAuth(
    connection: Connection,
    privateSigningKey: string,
) {
    return execReAuth(connection, getChallenge, getNewToken, privateSigningKey);
}

export async function signIn(connection: Partial<Connection>) {
    return execSignIn(
        connection,
        ethersHelper.prersonalSign,
        submitUserProfile,
    );
}

export async function createKeyPairsFromSig(
    connection: Partial<Connection>,
    nonce: number,
): Promise<ProfileKeys> {
    return execCreateKeyPairsFromSig(
        connection,
        ethersHelper.prersonalSign,
        nonce,
    );
}
