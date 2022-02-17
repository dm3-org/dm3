import { ethers } from 'ethers';

import { EthEncryptedData } from './Encryption';
import { Account, ApiConnection, Keys } from './Web3Provider';

export interface Message {
    to: string;
    from: string;
    timestamp: number;
    message: string;
}

export interface Envelop {
    message: string;
    signature: string;
}

export interface EncryptionEnvelop {
    encryptionVersion: 'x25519-xsalsa20-poly1305';
    data: string;
    selfData: string;
    to: string;
    from: string;
}

export enum MessageState {
    Created,
    Signed,
    Send,
    FailedToSend,
}

export function createMessage(
    to: string,
    from: string,
    message: string,
    getTimestamp: () => number,
): Message {
    return {
        to,
        from,
        timestamp: getTimestamp(),
        message,
    };
}

export async function submitMessage(
    apiConnection: ApiConnection,
    to: Account,
    message: Message,
    submitMessageApi: (
        apiConnection: ApiConnection,
        envelop: Envelop | EncryptionEnvelop,
    ) => Promise<void>,
    signWithEncryptionKey: (message: string, keys: Keys) => string,
    encryptSafely: ({
        publicKey,
        data,
        version,
    }: {
        publicKey: string;
        data: unknown;
        version: string;
    }) => EthEncryptedData,
    encrypt?: boolean,
): Promise<void> {
    const seralizedMessage = JSON.stringify(message);

    let envelop: Envelop | EncryptionEnvelop = {
        message: seralizedMessage,
        signature: signWithEncryptionKey(
            seralizedMessage,
            apiConnection.account?.keys as Keys,
        ),
    };

    if (encrypt) {
        envelop = {
            data: ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes(
                    JSON.stringify(
                        encryptSafely({
                            publicKey: to.keys?.publicMessagingKey as string,
                            data: envelop,
                            version: 'x25519-xsalsa20-poly1305',
                        }),
                    ),
                ),
            ),
            selfData: ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes(
                    JSON.stringify(
                        encryptSafely({
                            publicKey: apiConnection.account?.keys
                                ?.publicMessagingKey as string,
                            data: envelop,
                            version: 'x25519-xsalsa20-poly1305',
                        }),
                    ),
                ),
            ),
            to: to.address,
            from: (apiConnection.account as Account).address,
            encryptionVersion: 'x25519-xsalsa20-poly1305',
        };
    }

    await submitMessageApi(apiConnection, envelop);
}
