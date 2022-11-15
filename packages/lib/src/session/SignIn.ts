import { ethers } from 'ethers';
import { UserDB, UserStorage } from '../storage/Storage';
import { log } from '../shared/log';
import { createDB, load } from '../storage/Storage';
import { Account, ProfileKeys, UserProfile } from '../account/Account';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import {
    GetChallenge,
    GetNewToken,
    SubmitUserProfile,
} from '../external-apis/BackendAPI';
import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { stringify } from '../shared/stringify';
import {
    createKeyPair,
    createSigningKeyPair,
    createStorageKey,
    getStorageKeyCreationMessage,
} from '../crypto';

export async function reAuth(
    connection: Connection,
    getChallenge: GetChallenge,
    getNewToken: GetNewToken,
    personalSign: PersonalSign,
): Promise<string> {
    if (!connection.account) {
        throw Error('No account set');
    }
    const provider = connection.provider as ethers.providers.JsonRpcProvider;
    const challenge = await getChallenge(connection.account, connection);
    const signature = await personalSign(
        provider,
        connection.account.address,
        challenge,
    );

    return getNewToken(connection.account, connection, signature);
}

export async function createKeys(
    nonceMsgSig: string,
    nonce: number,
): Promise<ProfileKeys> {
    return {
        encryptionKeyPair: await createKeyPair(nonceMsgSig),
        signingKeyPair: await createSigningKeyPair(nonceMsgSig),
        storageEncryptionKey: nonceMsgSig,
        storageEncryptionNonce: nonce,
    };
}

export async function signIn(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    submitUserProfile: SubmitUserProfile,
    browserDataFile: UserStorage | undefined,
    externalDataFile: string | undefined,
    overwriteUserDb: Partial<UserDB>,
): Promise<{
    connectionState: ConnectionState;
    db?: UserDB;
}> {
    try {
        const provider =
            connection.provider as ethers.providers.JsonRpcProvider;
        const account = (connection.account as Account).address;

        let deliveryServiceToken: string;
        const nonce = 0;
        const nonceMsg = getStorageKeyCreationMessage(nonce);
        const signedNonceMsg = await personalSign(provider, account, nonceMsg);

        const keys = await createKeys(
            await createStorageKey(signedNonceMsg),
            nonce,
        );

        if (!externalDataFile && !browserDataFile) {
            const profile: UserProfile = {
                publicSigningKey: keys.signingKeyPair.publicKey,
                publicEncryptionKey: keys.encryptionKeyPair.publicKey,
                deliveryServices: ['dev-ds.dm3.eth'],
            };

            const signature = await personalSign(
                provider,
                account,
                stringify(profile),
            );

            deliveryServiceToken = await submitUserProfile(
                { address: account, profile },
                connection as Connection,
                {
                    profile,
                    signature,
                },
            );

            return {
                connectionState: ConnectionState.SignedIn,
                db: {
                    ...createDB(keys, deliveryServiceToken),
                    ...overwriteUserDb,
                },
            };
        } else {
            const externalData = externalDataFile
                ? await load(
                      JSON.parse(externalDataFile),
                      keys.storageEncryptionKey,
                  )
                : null;

            const dataFromBrowser = browserDataFile
                ? await load(browserDataFile, keys.storageEncryptionKey)
                : null;

            if (externalData && dataFromBrowser) {
                return {
                    connectionState: ConnectionState.SignedIn,
                    db: {
                        ...(externalData.lastChangeTimestamp >=
                        dataFromBrowser.lastChangeTimestamp
                            ? externalData
                            : dataFromBrowser),
                        ...overwriteUserDb,
                    },
                };
            } else {
                return {
                    connectionState: ConnectionState.SignedIn,
                    db: {
                        ...(externalData
                            ? externalData
                            : (dataFromBrowser as UserDB)),
                        ...overwriteUserDb,
                    },
                };
            }
        }
    } catch (e) {
        log(e as string);
        return {
            connectionState: ConnectionState.SignInFailed,
        };
    }
}

export function getSessionToken(signature: string) {
    return ethers.utils.keccak256(signature);
}
