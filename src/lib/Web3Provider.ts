import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { box, randomBytes } from 'tweetnacl';
import {
    decodeUTF8,
    encodeUTF8,
    encodeBase64,
    decodeBase64,
} from 'tweetnacl-util';
import { encryptSafely } from './Encryption';

import { log } from './log';

export interface Keys {
    publicKey?: string;
    publicMessagingKey?: string;
    privateMessagingKey?: string;
}

export interface Account {
    address: string;
    keys?: Keys;
}

export enum ConnectionState {
    CheckingProvider,
    NoProvider,
    SignInReady,
    AccountConntectReady,
    WaitingForAccountConntection,
    WaitingForSignIn,
    AccountConnectionRejected,
    SignInFailed,
    SignedIn,
    KeyCreation,
}

export interface ApiConnection {
    connectionState: ConnectionState;
    account?: Account;
    sessionToken?: string;
    provider?: ethers.providers.JsonRpcProvider;
    socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
}

export async function getWeb3Provider(provider: unknown): Promise<{
    provider?: ethers.providers.Web3Provider;
    connectionState: ConnectionState;
}> {
    return provider
        ? {
              provider: new ethers.providers.Web3Provider(
                  provider as
                      | ethers.providers.ExternalProvider
                      | ethers.providers.JsonRpcFetchFunc,
              ),
              connectionState: ConnectionState.AccountConntectReady,
          }
        : {
              connectionState: ConnectionState.NoProvider,
          };
}

export async function connectAccount(
    provider: ethers.providers.JsonRpcProvider,
    requestAccounts: (
        provider: ethers.providers.JsonRpcProvider,
    ) => Promise<string>,
): Promise<{
    account?: string;
    connectionState: ConnectionState;
}> {
    try {
        return {
            account: await requestAccounts(provider),
            connectionState: ConnectionState.SignInReady,
        };
    } catch (e) {
        return {
            connectionState: ConnectionState.AccountConnectionRejected,
        };
    }
}

export async function signIn(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
    requestChallenge: (account: string) => Promise<string>,
    personalSign: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
        challenge: string,
    ) => Promise<string>,
    submitSignedChallenge: (
        challenge: string,
        signature: string,
    ) => Promise<void>,
): Promise<{
    connectionState: ConnectionState;
    sessionToken?: string;
}> {
    try {
        const challenge = await requestChallenge(account);

        log(`Sign in challenge: ${challenge}`);

        const signature = await personalSign(provider, account, challenge);
        submitSignedChallenge(challenge, signature);

        return {
            connectionState: ConnectionState.SignedIn,
            sessionToken: getSessionToken(signature),
        };
    } catch (e) {
        return {
            connectionState: ConnectionState.SignInFailed,
        };
    }
}

export function getSessionToken(signature: string) {
    return ethers.utils.keccak256(signature);
}

export function getAccountDisplayName(
    accountAddress: string | undefined,
    ensNames: Map<string, string>,
): string {
    if (!accountAddress) {
        return '';
    }
    if (ensNames.get(accountAddress)) {
        return ensNames.get(accountAddress) as string;
    }
    return accountAddress.length > 10
        ? accountAddress.substring(0, 4) +
              '...' +
              accountAddress.substring(accountAddress.length - 4)
        : accountAddress;
}

export async function addContact(
    apiConnection: ApiConnection,
    input: string,
    resolveName: (
        provider: ethers.providers.JsonRpcProvider,
        input: string,
    ) => Promise<string | null>,
    addContactAPI: (
        apiConnection: ApiConnection,
        contactAddress: string,
    ) => Promise<void>,
) {
    if (ethers.utils.isAddress(input)) {
        await addContactAPI(apiConnection, input);
    } else {
        const address = await resolveName(
            apiConnection.provider as ethers.providers.JsonRpcProvider,
            input,
        );
        if (address) {
            addContactAPI(apiConnection, address);
        } else {
            throw Error(`Couldn't resolve name`);
        }
    }
}

export async function createPublicKey(
    apiConnection: ApiConnection,
    getPublicKey: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
    ) => Promise<string>,
): Promise<string> {
    return getPublicKey(
        apiConnection.provider as ethers.providers.JsonRpcProvider,
        (apiConnection.account as Account).address,
    );
}

export function createMessagingKeyPair(): {
    publicKey: string;
    privateKey: string;
} {
    const keypair = box.keyPair();
    return {
        publicKey: encodeBase64(keypair.publicKey),
        privateKey: encodeBase64(keypair.secretKey),
    };
}

export async function submitKeys(
    apiConnection: ApiConnection,
    keys: Keys,
    submitKeysApi: (
        apiConnection: ApiConnection,
        encryptedKeys: Keys,
    ) => Promise<void>,
): Promise<void> {
    const encryptedPrivateKey = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
            JSON.stringify(
                encryptSafely({
                    publicKey: keys.publicKey as string,
                    data: keys.privateMessagingKey,
                    version: 'x25519-xsalsa20-poly1305',
                }),
            ),
        ),
    );

    submitKeysApi(apiConnection, {
        privateMessagingKey: encryptedPrivateKey,
        publicMessagingKey: keys.publicMessagingKey,
        publicKey: keys.publicKey,
    });
}
