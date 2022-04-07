import { ethers } from 'ethers';
import {
    decryptEnvelop,
    EncryptSafely,
    SignWithEncryptionKey,
} from '../encryption/Encryption';
import { Connection } from '../web3-provider/Web3Provider';
import {
    getConversation,
    StorageEnvelopContainer,
    UserDB,
} from '../storage/Storage';
import { log } from '../shared/log';
import { Account, Keys } from '../account/Account';
import {
    CreatePendingEntry,
    GetNewMessages,
    SubmitMessage,
} from '../external-apis/BackendAPI';

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
    userDb: UserDB,
    to: Account,
    message: Message,
    submitMessageApi: SubmitMessage,
    signWithEncryptionKey: SignWithEncryptionKey,
    encryptSafely: EncryptSafely,
    createPendingEntry: CreatePendingEntry,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Envelop) => void,
) {
    log('Submitting message');

    const innerEnvelop: Envelop = {
        message,
        signature: signWithEncryptionKey(message, userDb?.keys as Keys),
    };

    const allOnSuccess = () => {
        if (onSuccess) {
            onSuccess(innerEnvelop);
        }
    };

    if (haltDelivery) {
        log('- Halt delivery');
        createPendingEntry(
            connection,
            userDb,
            innerEnvelop.message.from,
            innerEnvelop.message.to,
        );
        storeMessages([
            { envelop: innerEnvelop, messageState: MessageState.Created },
        ]);
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
                            publicKey: userDb?.keys
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
        await submitMessageApi(connection, userDb, envelop, allOnSuccess, () =>
            log('submit message error'),
        );

        storeMessages([
            { envelop: innerEnvelop, messageState: MessageState.Send },
        ]);
    }
}

export function getId(envelop: Envelop): string {
    return ethers.utils.id(JSON.stringify(envelop.message));
}

function decryptMessages(
    envelops: EncryptionEnvelop[],
    userDb: UserDB,
    connection: Connection,
): Promise<Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Envelop> =>
                decryptEnvelop(connection, userDb, envelop),
        ),
    );
}

export async function getMessages(
    connection: Connection,
    contact: string,
    getNewMessages: GetNewMessages,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    userDb: UserDB,
): Promise<StorageEnvelopContainer[]> {
    const envelops = await getNewMessages(connection, userDb, contact);
    const decryptedEnvelops = await decryptMessages(
        envelops,
        userDb,
        connection,
    );

    storeMessages(
        decryptedEnvelops.map(
            (envelop): StorageEnvelopContainer => ({
                envelop: envelop,
                messageState: MessageState.Send,
            }),
        ),
    );

    return getConversation(contact, connection, userDb);
}
