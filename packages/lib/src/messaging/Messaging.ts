import { ethers } from 'ethers';
import {
    decryptEnvelop,
    EncryptSafely,
    SignWithSignatureKey,
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
import stringify from 'safe-stable-stringify';

export interface Message {
    to: string;
    from: string;
    timestamp: number;
    message: string;
    type: MessageType;
    referenceMessageHash?: string;
    attachments?: Attachment[];
    replyDeliveryInstruction?: string;
    signature: string;
}

export type MessageType =
    | 'NEW'
    | 'DELETE_REQUEST'
    | 'EDIT'
    | 'THREAD_POST'
    | 'REACTION'
    | 'READ_RECEIPT';

export interface Attachment {
    type: string;
    data: string;
}

export interface Envelop {
    message: Message;
    signature: string;
    id?: string;
}

export interface EncryptionEnvelop {
    encryptionVersion: 'x25519-xsalsa20-poly1305';
    encryptedData: string;
    to: string;
    from: string;
    deliveryServiceIncommingTimestamp?: number;
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
    type: MessageType,
    signature: string,
    referenceMessageHash?: string,
    attachments?: Attachment[],
    replyDeliveryInstruction?: string,
): Message {
    return {
        to,
        from,
        timestamp: getTimestamp(),
        message,
        type,
        referenceMessageHash,
        signature,
        attachments,
        replyDeliveryInstruction,
    };
}

export async function submitMessage(
    connection: Connection,
    userDb: UserDB,
    to: Account,
    message: Message,
    submitMessageApi: SubmitMessage,
    signWithSignatureKey: SignWithSignatureKey,
    encryptSafely: EncryptSafely,
    createPendingEntry: CreatePendingEntry,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Envelop) => void,
) {
    log('Submitting message');

    const innerEnvelop: Envelop = {
        message,
        signature: signWithSignatureKey(message, userDb?.keys as Keys),
    };

    const allOnSuccess = () => {
        if (onSuccess) {
            onSuccess(innerEnvelop);
        }
    };

    await createPendingEntry(
        connection,
        userDb,
        innerEnvelop.message.from,
        innerEnvelop.message.to,
    );

    if (haltDelivery) {
        log('- Halt delivery');
        storeMessages([
            { envelop: innerEnvelop, messageState: MessageState.Created },
        ]);
    } else {
        if (!to.profile) {
            throw Error('Contact has no profile');
        }
        const envelop: EncryptionEnvelop = {
            encryptedData: ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes(
                    stringify(
                        encryptSafely({
                            publicKey: to.profile.publicKeys
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
        log('- Message sent');
    }
}

function decryptMessages(
    envelops: EncryptionEnvelop[],
    userDb: UserDB,
): Promise<Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Envelop> =>
                decryptEnvelop(userDb, envelop),
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
    const envelops = await Promise.all(
        (
            await getNewMessages(connection, userDb, contact)
        )
            .filter((envelop) =>
                envelop.deliveryServiceIncommingTimestamp ? true : false,
            )
            .map(async (envelop): Promise<StorageEnvelopContainer> => {
                const decryptedEnvelop = await decryptMessages(
                    [envelop],
                    userDb,
                );
                return {
                    envelop: decryptedEnvelop[0],
                    messageState: MessageState.Send,
                    deliveryServiceIncommingTimestamp:
                        envelop.deliveryServiceIncommingTimestamp!,
                };
            }),
    );

    storeMessages(envelops);

    return getConversation(contact, connection, userDb);
}
