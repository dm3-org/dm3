import { ethers } from 'ethers';
import { UserDB } from '../storage/Storage';
import { log } from '../shared/log';
import { createDB, load } from '../storage/Storage';
import { Account, Keys, PublicKeys } from '../account/Account';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';

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
    syncNotifications: ((synced: boolean) => void)[],
    dataFile?: string,
): Promise<{
    connectionState: ConnectionState;
    db?: UserDB;
}> {
    try {
        const provider =
            connection.provider as ethers.providers.JsonRpcProvider;
        const account = (connection.account as Account).address;
        const challengeResponse = await requestChallenge(account);

        log(`Sign in challenge: ${challengeResponse.challenge}`);

        let publicKeys: PublicKeys;
        let deliveryServiceToken: string;

        if (!dataFile) {
            const signature = await personalSign(
                provider,
                account,
                challengeResponse.challenge,
            );
            await submitSignedChallenge(challengeResponse.challenge, signature);
            deliveryServiceToken = getSessionToken(signature);

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

            await submitPublicKeyApi(account, publicKeys, deliveryServiceToken);

            return {
                connectionState: ConnectionState.SignedIn,
                db: createDB(keys, deliveryServiceToken, syncNotifications),
            };
        } else {
            return {
                connectionState: ConnectionState.SignedIn,
                db: await load(
                    connection as Connection,
                    syncNotifications,
                    JSON.parse(dataFile),
                ),
            };
        }
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
