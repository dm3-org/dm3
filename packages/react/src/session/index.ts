import * as Lib from 'dm3-lib';
import { reAuth as execReAuth } from './reAuth';
import { signIn as execSignIn } from './SignIn/signIn';
import { createKeyPairsFromSig as execCreateKeyPairsFromSig } from './SignIn/signProfileKeyPair';

export { getSessionFromStorage } from './getSessionFromStorage';

export async function reAuth(
    connection: Lib.Connection,
    privateSigningKey: string,
) {
    return execReAuth(
        connection,
        Lib.deliveryApi.getChallenge,
        Lib.deliveryApi.getNewToken,
        privateSigningKey,
    );
}

export async function signIn(connection: Partial<Lib.Connection>) {
    return execSignIn(
        connection,
        Lib.shared.ethersHelper.prersonalSign,
        Lib.deliveryApi.submitUserProfile,
    );
}

export async function createKeyPairsFromSig(
    connection: Partial<Lib.Connection>,
    nonce: number,
): Promise<Lib.profile.ProfileKeys> {
    return execCreateKeyPairsFromSig(
        connection,
        Lib.shared.ethersHelper.prersonalSign,
        nonce,
    );
}
