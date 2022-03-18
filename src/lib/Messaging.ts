import { ethers } from 'ethers';
import { decryptEnvelop, EthEncryptedData } from './Encryption';
import { Connection } from './Web3Provider';
import {
    getConversation,
    StorageEnvelopContainer,
    storeMessages,
} from './Storage';
import { log } from './log';
import { Account, Keys } from './Account';

export interface Message {
    to: string;
    from: string;
    timestamp: number;
    message: string;
}

export interface Envelop {
    message: Message;
    signature: string;
    id?: string;
}

export interface EncryptionEnvelop {
    encryptionVersion: 'x25519-xsalsa20-poly1305';
    toEncryptedData: string;
    fromEncryptedData: string;
    to: string;
    from: string;
}

export enum MessageState {
    Created,
    Signed,
    Send,
    Read,
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
    connection: Connection,
    to: Account,
    message: Message,
    submitMessageApi: (
        connection: Connection,
        envelop: EncryptionEnvelop,
        onSuccess: () => void,
        onError: () => void,
    ) => Promise<void>,
    signWithEncryptionKey: (message: Message, keys: Keys) => string,
    encryptSafely: ({
        publicKey,
        data,
        version,
    }: {
        publicKey: string;
        data: unknown;
        version: string;
    }) => EthEncryptedData,
    haltDelivery: boolean,
    onSuccess?: (envelop: Envelop) => void,
): Promise<void> {
    log('Submitting message');

    const innerEnvelop: Envelop = {
        message,
        signature: signWithEncryptionKey(message, connection.db?.keys as Keys),
    };

    const allOnSuccess = () => {
        if (onSuccess) {
            onSuccess(innerEnvelop);
        }
    };

    if (haltDelivery) {
        storeMessages(
            [{ envelop: innerEnvelop, messageState: MessageState.Created }],
            connection,
        );
    } else {
        const envelop: EncryptionEnvelop = {
            toEncryptedData: ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes(
                    JSON.stringify(
                        encryptSafely({
                            publicKey: to.publicKeys
                                ?.publicMessagingKey as string,
                            data: innerEnvelop,
                            version: 'x25519-xsalsa20-poly1305',
                        }),
                    ),
                ),
            ),
            fromEncryptedData: ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes(
                    JSON.stringify(
                        encryptSafely({
                            publicKey: connection.db?.keys
                                ?.publicMessagingKey as string,
                            data: innerEnvelop,
                            version: 'x25519-xsalsa20-poly1305',
                        }),
                    ),
                ),
            ),
            to: to.address,
            from: (connection.account as Account).address,
            encryptionVersion: 'x25519-xsalsa20-poly1305',
        };
        await submitMessageApi(connection, envelop, allOnSuccess, () =>
            log('submit message error'),
        );
        storeMessages(
            [{ envelop: innerEnvelop, messageState: MessageState.Send }],
            connection,
        );
    }
}

export function getId(envelop: Envelop): string {
    return ethers.utils.id(JSON.stringify(envelop.message));
}

function decryptMessages(
    envelops: EncryptionEnvelop[],
    connection: Connection,
): Promise<Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Envelop> =>
                decryptEnvelop(connection, envelop),
        ),
    );
}

export async function getMessages(
    connection: Connection,
    contact: string,
    getNewMessages: (
        connection: Connection,
        contact: string,
    ) => Promise<EncryptionEnvelop[]>,
): Promise<StorageEnvelopContainer[]> {
    const envelops = await getNewMessages(connection, contact);
    const decryptedEnvelops = await decryptMessages(envelops, connection);

    storeMessages(
        decryptedEnvelops.map(
            (envelop): StorageEnvelopContainer => ({
                envelop: envelop,
                messageState: MessageState.Send,
            }),
        ),
        connection,
    );

    return getConversation(contact, connection);
}
