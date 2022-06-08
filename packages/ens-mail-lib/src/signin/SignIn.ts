import { ethers } from 'ethers';
import { UserDB, UserStorage } from '../storage/Storage';
import { log } from '../shared/log';
import { createDB, load } from '../storage/Storage';
import { Account, CreateKeys, ProfileRegistryEntry } from '../account/Account';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import { SubmitProfileRegistryEntry } from '../external-apis/BackendAPI';
import { GetPublicKey, PersonalSign } from '../external-apis/InjectedWeb3API';

export async function signIn(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    submitProfileRegistryEntry: SubmitProfileRegistryEntry,
    createKeys: CreateKeys,
    getPublicKey: GetPublicKey,
    browserDataFile: UserStorage | undefined,
    externalDataFile: string | undefined,
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
            const encryptionPublicKey = await getPublicKey(provider, account);
            const keyPair = createKeys(encryptionPublicKey);

            const keys = {
                ...keyPair,
                publicKey: encryptionPublicKey,
            };

            const profileRegistryEntry: ProfileRegistryEntry = {
                publicKeys: {
                    publicKey: encryptionPublicKey,
                    publicMessagingKey: keyPair.publicMessagingKey,
                    publicSigningKey: keyPair.publicSigningKey,
                },
            };

            const signature = await personalSign(
                provider,
                account,
                JSON.stringify(profileRegistryEntry),
            );

            deliveryServiceToken = await submitProfileRegistryEntry(account, {
                profileRegistryEntry,
                signature,
            });

            return {
                connectionState: ConnectionState.SignedIn,
                db: createDB(keys, deliveryServiceToken),
            };
        } else {
            const externalData = externalDataFile
                ? await load(
                      connection as Connection,
                      JSON.parse(externalDataFile),
                  )
                : null;

            const dataFromBrowser = browserDataFile
                ? await load(
                      connection as Connection,
                      browserDataFile,
                      externalData?.keys.storageEncryptionKey,
                  )
                : null;

            if (externalData && dataFromBrowser) {
                return {
                    connectionState: ConnectionState.SignedIn,
                    db:
                        externalData.lastChangeTimestamp >=
                        dataFromBrowser.lastChangeTimestamp
                            ? externalData
                            : dataFromBrowser,
                };
            } else {
                return {
                    connectionState: ConnectionState.SignedIn,
                    db: externalData
                        ? externalData
                        : (dataFromBrowser as UserDB),
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
