import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { encryptSafely } from './Encryption';

export interface Keys {
    publicKey?: string;
    publicMessagingKey?: string;
    privateMessagingKey?: string;
    publicSigningKey?: string;
    privateSigningKey?: string;
}

export interface EncryptedKeys {
    publicKey?: string;
    publicMessagingKey?: string;

    publicSigningKey?: string;
    encryptedPrivateKeys: string;
}

export interface PrivateKeys {
    privateMessagingKey: string;
    privateSigningKey: string;
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

export function createMessagingKeyPair(): Partial<Keys> {
    const encryptionKeyPair = nacl.box.keyPair();
    const signingKeyPair = nacl.sign.keyPair();
    return {
        publicMessagingKey: encodeBase64(encryptionKeyPair.publicKey),
        privateMessagingKey: encodeBase64(encryptionKeyPair.secretKey),
        publicSigningKey: encodeBase64(signingKeyPair.publicKey),
        privateSigningKey: encodeBase64(signingKeyPair.secretKey),
    };
}

export async function submitEncryptedKeys(
    accountAddress: string,
    sessionToken: string,
    keys: Keys,
    submitKeysApi: (
        accountAddress: string,
        encryptedKeys: EncryptedKeys,
        token: string,
    ) => Promise<void>,
): Promise<void> {
    const keysToEncrypt: PrivateKeys = {
        privateMessagingKey: keys.privateMessagingKey as string,
        privateSigningKey: keys.privateSigningKey as string,
    };

    const encryptedKeys = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
            JSON.stringify(
                encryptSafely({
                    publicKey: keys.publicKey as string,
                    data: JSON.stringify(keysToEncrypt),
                    version: 'x25519-xsalsa20-poly1305',
                }),
            ),
        ),
    );

    submitKeysApi(
        accountAddress,
        {
            encryptedPrivateKeys: encryptedKeys,
            publicMessagingKey: keys.publicMessagingKey,
            publicSigningKey: keys.publicSigningKey,
            publicKey: keys.publicKey,
        },
        sessionToken,
    );
}
