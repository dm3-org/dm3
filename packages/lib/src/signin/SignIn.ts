import { ethers } from 'ethers';
import { UserDB, UserStorage } from '../storage/Storage';
import { log } from '../shared/log';
import { createDB, load } from '../storage/Storage';
import { Account, CreateKeys, UserProfile } from '../account/Account';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import {
    GetChallenge,
    GetNewToken,
    SubmitUserProfile,
} from '../external-apis/BackendAPI';
import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { GetSymmetricalKeyFromSignature } from '../encryption/SymmetricalEncryption';

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
    const challenge = await getChallenge(connection.account);
    const signature = await personalSign(
        provider,
        connection.account.address,
        challenge,
    );

    return getNewToken(connection.account, signature);
}

export async function signIn(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    submitUserProfile: SubmitUserProfile,
    createKeys: CreateKeys,
    getSymmetricalKeyFromSignature: GetSymmetricalKeyFromSignature,
    browserDataFile: UserStorage | undefined,
    externalDataFile: string | undefined,
    overwriteUserDb: Partial<UserDB>,
    preLoadedKey?: string,
): Promise<{
    connectionState: ConnectionState;
    db?: UserDB;
}> {
    try {
        const provider =
            connection.provider as ethers.providers.JsonRpcProvider;
        const account = (connection.account as Account).address;

        let deliveryServiceToken: string;

        if (!externalDataFile && !browserDataFile) {
            const keys = await createKeys(
                connection,
                personalSign,
                getSymmetricalKeyFromSignature,
            );

            const profile: UserProfile = {
                publicSigningKey: keys.publicSigningKey,
                publicEncryptionKey: keys.publicMessagingKey,
                deliveryServices: [connection.defaultServiceUrl!],
            };

            const signature = await personalSign(
                provider,
                account,
                JSON.stringify(profile),
            );

            deliveryServiceToken = await submitUserProfile(
                { address: account, profile },
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
                      connection as Connection,
                      JSON.parse(externalDataFile),
                      getSymmetricalKeyFromSignature,
                      personalSign,
                      preLoadedKey,
                  )
                : null;

            const dataFromBrowser = browserDataFile
                ? await load(
                      connection as Connection,
                      browserDataFile,
                      getSymmetricalKeyFromSignature,
                      personalSign,
                      preLoadedKey ?? externalData?.keys.storageEncryptionKey,
                  )
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
