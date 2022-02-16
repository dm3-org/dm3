import { ethers } from 'ethers';

import { encryptSafely, EthEncryptedData } from './Encryption';
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
): Message {
    return {
        to,
        from,
        timestamp: new Date().getTime(),
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

export async function getMessages(
    apiConnection: ApiConnection,
    contact: string,
    getMessagesApi: (
        apiConnection: ApiConnection,
        contact: string,
    ) => Promise<(Envelop | EncryptionEnvelop)[]>,
): Promise<(Envelop | EncryptionEnvelop)[]> {
    return await getMessagesApi(apiConnection, contact);
}
