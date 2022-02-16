import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import nacl from 'tweetnacl';
import {
    decodeUTF8,
    encodeUTF8,
    encodeBase64,
    decodeBase64,
} from 'tweetnacl-util';
import { getPublicKey } from '../external-apis/InjectedWeb3API';
import { encryptSafely } from './Encryption';

import { log } from './log';

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

export async function signIn(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
    requestChallenge: (
        account: string,
    ) => Promise<{ challenge: string; hasEncryptionKey: boolean }>,
    personalSign: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
        challenge: string,
    ) => Promise<string>,
    submitSignedChallenge: (
        challenge: string,
        signature: string,
    ) => Promise<void>,
    getKeys: (
        accountAddress: string,
        sessionToken: string,
    ) => Promise<EncryptedKeys | undefined>,
    decrypt: (
        provider: ethers.providers.JsonRpcProvider,
        encryptedData: string,
        account: string,
    ) => Promise<string>,
    submitPublicKeyApi: (
        accountAddress: string,
        encryptedKeys: Keys,
        token: string,
    ) => Promise<void>,
    submitEncryptedKeys: (
        accountAddress: string,
        sessionToken: string,
        keys: Keys,
        submitKeysApi: (
            accountAddress: string,
            encryptedKeys: EncryptedKeys,
            token: string,
        ) => Promise<void>,
    ) => Promise<void>,
): Promise<{
    connectionState: ConnectionState;
    sessionToken?: string;
    keys?: Keys;
}> {
    try {
        const challengeResponse = await requestChallenge(account);

        log(`Sign in challenge: ${challengeResponse.challenge}`);

        const signature = await personalSign(
            provider,
            account,
            challengeResponse.challenge,
        );
        await submitSignedChallenge(challengeResponse.challenge, signature);
        const sessionToken = getSessionToken(signature);

        let keys: Keys | undefined;

        if (!challengeResponse.hasEncryptionKey) {
            const keyPair = createMessagingKeyPair();

            keys = {
                ...keyPair,
                publicKey: await createPublicKey(
                    provider,
                    account,

                    getPublicKey,
                ),
            };

            await submitEncryptedKeys(
                account,
                sessionToken,
                keys,
                submitPublicKeyApi,
            );
        } else {
            const encryptedKeys: EncryptedKeys = (await getKeys(
                account,
                sessionToken,
            )) as EncryptedKeys;
            const decryptedPrivateKeys: PrivateKeys = JSON.parse(
                JSON.parse(
                    await decrypt(
                        provider,
                        encryptedKeys.encryptedPrivateKeys,
                        account,
                    ),
                ).data,
            );
            keys = {
                ...decryptedPrivateKeys,
                publicKey: encryptedKeys.publicKey,
                publicMessagingKey: encryptedKeys.publicMessagingKey,
                publicSigningKey: encryptedKeys.publicSigningKey,
            };
        }

        return {
            connectionState: ConnectionState.SignedIn,
            sessionToken,
            keys,
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
    provider: ethers.providers.JsonRpcProvider,
    accountAddress: string,
    getPublicKey: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
    ) => Promise<string>,
): Promise<string> {
    return getPublicKey(provider, accountAddress);
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
