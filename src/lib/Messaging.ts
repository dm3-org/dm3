import { ethers } from 'ethers';
import { decryptEnvelop, EthEncryptedData } from './Encryption';
import { Connection } from './Web3Provider';
import { getConversation, storeMessages } from './Storage';
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
    wasEncrypted: boolean;
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

export function isEncryptionEnvelop(
    envelop: EncryptionEnvelop | Envelop,
): envelop is EncryptionEnvelop {
    return typeof (envelop as EncryptionEnvelop).encryptionVersion === 'string';
}

export async function submitMessage(
    connection: Connection,
    to: Account,
    message: Message,
    submitMessageApi: (
        connection: Connection,
        envelop: Envelop | EncryptionEnvelop,
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
    onSuccess: () => void,
    encrypt?: boolean,
): Promise<void> {
    const innerEnvelop: Envelop = {
        message,
        signature: signWithEncryptionKey(message, connection.db?.keys as Keys),
        wasEncrypted: encrypt ? true : false,
    };

    const allOnSuccess = () => {
        onSuccess();
        storeMessages([innerEnvelop], connection);
    };
    if (encrypt) {
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
    } else {
        await submitMessageApi(connection, innerEnvelop, allOnSuccess, () =>
            log('submit message error'),
        );
    }
}

export function sortEnvelops(envelops: Envelop[]): Envelop[] {
    return envelops.sort((a, b) => a.message.timestamp - b.message.timestamp);
}

export function getId(envelop: Envelop): string {
    return ethers.utils.id(JSON.stringify(envelop.message));
}

function decryptMessages(
    envelops: Envelop[],
    connection: Connection,
): Promise<Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Envelop> => ({
                ...(isEncryptionEnvelop(envelop)
                    ? (decryptEnvelop(connection, envelop) as Envelop)
                    : envelop),
                wasEncrypted: isEncryptionEnvelop(envelop) ? true : false,
            }),
        ),
    );
}

export async function getMessages(
    connection: Connection,
    contact: string,
    getNewMessages: (
        connection: Connection,
        contact: string,
    ) => Promise<Envelop[]>,
): Promise<Envelop[]> {
    const envelops = await getNewMessages(connection, contact);
    const decryptedEnvelops = await decryptMessages(envelops, connection);

    storeMessages(decryptedEnvelops, connection);

    return getConversation(contact, connection);
}

export function getEnvelopMetaData(envelop: Envelop | EncryptionEnvelop): {
    from: string;
    to: string;
} {
    return isEncryptionEnvelop(envelop)
        ? {
              from: (envelop as EncryptionEnvelop).from,
              to: (envelop as EncryptionEnvelop).to,
          }
        : {
              from: (envelop as Envelop).message.from,
              to: (envelop as Envelop).message.to,
          };
}
