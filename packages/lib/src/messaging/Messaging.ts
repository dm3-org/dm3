import { Account, ProfileKeys } from '../account/Account';
import { decryptAsymmetric, EncryptAsymmetric, sign } from '../crypto';
import {
    CreatePendingEntry,
    GetNewMessages,
    SubmitMessage,
} from '../external-apis/BackendAPI';
import { stringify } from '../shared/stringify';
import { log } from '../shared/log';
import {
    getConversation,
    StorageEnvelopContainer,
    UserDB,
} from '../storage/Storage';
import { Connection } from '../web3-provider/Web3Provider';

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
    | 'REPLY'
    | 'REACTION'
    | 'READ_RECEIPT'
    | 'RESEND_REQUEST';

export interface Attachment {
    type: string;
    data: string;
}

export interface Envelop {
    message: Message;
    signature: string;
    id?: string;
}

export interface Postmark {
    messageHash: string;
    incommingTimestamp: number;
    signature: string;
}

export interface DeliveryInformation {
    to: string;
    from: string;
    deliveryInstruction?: string;
}

export interface EncryptionEnvelop {
    encryptionVersion: 'x25519-chacha20-poly1305';
    message: string;
    deliveryInformation: string;
    postmark?: string;
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
    deliveryServiceEncryptionPubKey: string,
    submitMessageApi: SubmitMessage,
    encryptAsymmetric: EncryptAsymmetric,
    createPendingEntry: CreatePendingEntry,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Envelop) => void,
) {
    log('Submitting message');

    const innerEnvelop: Envelop = {
        message,
        signature: await sign(
            (userDb?.keys as ProfileKeys).signingKeyPair.privateKey,
            stringify(message),
        ),
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

        const deliveryInformation: DeliveryInformation = {
            to: to.address,
            from: (connection.account as Account).address,
        };
        const envelop: EncryptionEnvelop = {
            message: stringify(
                await encryptAsymmetric(
                    to.profile.publicEncryptionKey,
                    stringify(innerEnvelop),
                ),
            ),
            deliveryInformation: stringify(
                await encryptAsymmetric(
                    deliveryServiceEncryptionPubKey,
                    stringify(deliveryInformation),
                ),
            ),
            encryptionVersion: 'x25519-chacha20-poly1305',
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

async function decryptMessages(
    envelops: EncryptionEnvelop[],
    userDb: UserDB,
): Promise<Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Envelop> =>
                JSON.parse(
                    await decryptAsymmetric(
                        userDb.keys.encryptionKeyPair,
                        JSON.parse(envelop.message),
                    ),
                ),
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
        ).map(async (envelop): Promise<StorageEnvelopContainer> => {
            const decryptedEnvelop = await decryptMessages([envelop], userDb);
            const decryptedPostmark = JSON.parse(
                await decryptAsymmetric(
                    userDb.keys.encryptionKeyPair,
                    JSON.parse(envelop.postmark!),
                ),
            );

            return {
                envelop: decryptedEnvelop[0],
                messageState: MessageState.Send,
                deliveryServiceIncommingTimestamp:
                    decryptedPostmark.incommingTimestamp,
            };
        }),
    );

    storeMessages(envelops);

    return getConversation(contact, connection, userDb);
}
