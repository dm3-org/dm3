import { ethers } from 'ethers';
import { Connection } from '.';
import { log } from './log';
import { ConnectionState } from './Web3Provider';
import { load } from './Storage';
import { Account, Keys, PublicKeys } from './Account';

export async function signIn(
    connection: Partial<Connection>,
    requestChallenge: (
        account: string,
    ) => Promise<{ challenge: string; hasKeys: boolean }>,
    personalSign: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
        challenge: string,
    ) => Promise<string>,
    submitSignedChallenge: (
        challenge: string,
        signature: string,
    ) => Promise<void>,
    submitPublicKeyApi: (
        accountAddress: string,
        keys: PublicKeys,
        token: string,
    ) => Promise<void>,
    createMessagingKeyPair: (encryptionPublicKey: string) => Keys,
    getPublicKey: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
    ) => Promise<string>,
    dataFile?: string,
): Promise<{
    connectionState: ConnectionState;
    sessionToken?: string;
    keys?: PublicKeys;
}> {
    try {
        const provider =
            connection.provider as ethers.providers.JsonRpcProvider;
        const account = (connection.account as Account).address;
        const challengeResponse = await requestChallenge(account);

        log(`Sign in challenge: ${challengeResponse.challenge}`);

        const signature = await personalSign(
            provider,
            account,
            challengeResponse.challenge,
        );
        await submitSignedChallenge(challengeResponse.challenge, signature);
        const sessionToken = getSessionToken(signature);

        let publicKeys: PublicKeys;

        if (!dataFile) {
            const encryptionPublicKey = await getPublicKey(provider, account);
            const keyPair = createMessagingKeyPair(encryptionPublicKey);

            const keys = {
                ...keyPair,
                publicKey: encryptionPublicKey,
            };

            publicKeys = {
                publicKey: encryptionPublicKey,
                publicMessagingKey: keyPair.publicMessagingKey,
                publicSigningKey: keyPair.publicSigningKey,
            };

            await submitPublicKeyApi(account, publicKeys, sessionToken);

            (connection as Connection).db.keys = keys;
            (connection.account as Account).publicKeys = publicKeys;
        } else {
            publicKeys = await load(
                connection as Connection,
                JSON.parse(dataFile),
            );
        }

        return {
            connectionState: ConnectionState.SignedIn,
            sessionToken,
            keys: publicKeys,
        };
    } catch (e) {
        console.log(e);
        return {
            connectionState: ConnectionState.SignInFailed,
        };
    }
}

export function getSessionToken(signature: string) {
    return ethers.utils.keccak256(signature);
}
