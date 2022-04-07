import { ethers } from 'ethers';
import { UserDB } from '../storage/Storage';
import { log } from '../shared/log';
import { createDB, load } from '../storage/Storage';
import {
    Account,
    Keys,
    PublicKeys,
    ProfileRegistryEntry,
} from '../account/Account';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';

export async function signIn(
    connection: Partial<Connection>,
    personalSign: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
        challenge: string,
    ) => Promise<string>,
    submitProfileRegistryEntry: (
        accountAddress: string,
        profileRegistryEntry: ProfileRegistryEntry,
        signature: string,
    ) => Promise<string>,
    createKeys: (encryptionPublicKey: string) => Keys,
    getPublicKey: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
    ) => Promise<string>,
    dataFile?: string,
): Promise<{
    connectionState: ConnectionState;
    db?: UserDB;
}> {
    try {
        const provider =
            connection.provider as ethers.providers.JsonRpcProvider;
        const account = (connection.account as Account).address;

        let deliveryServiceToken: string;

        if (!dataFile) {
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

            deliveryServiceToken = await submitProfileRegistryEntry(
                account,
                profileRegistryEntry,
                signature,
            );

            return {
                connectionState: ConnectionState.SignedIn,
                db: createDB(keys, deliveryServiceToken),
            };
        } else {
            return {
                connectionState: ConnectionState.SignedIn,
                db: await load(connection as Connection, JSON.parse(dataFile)),
            };
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
