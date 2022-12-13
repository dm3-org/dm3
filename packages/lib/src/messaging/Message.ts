import axios from 'axios';
import { Account, ProfileKeys } from '../account/Account';
import { decryptAsymmetric, EncryptAsymmetric } from '../crypto';
import { getDeliveryServiceProfile } from '../delivery';
import {
    CreatePendingEntry,
    GetNewMessages,
    SubmitMessage,
} from '../external-apis/BackendAPI';
import { log } from '../shared/log';
import {
    getConversation,
    StorageEnvelopContainer,
    UserDB,
} from '../storage/Storage';
import { Connection } from '../web3-provider/Web3Provider';
import { buildEnvelop, EncryptionEnvelop, Envelop } from './Envelop';

export interface MessageMetadata {
    to: string;
    from: string;
    timestamp: number;
    referenceMessageHash?: string;
    replyDeliveryInstruction?: string;
    type: MessageType;
}

export interface Message {
    message: string;
    metadata: MessageMetadata;
    attachments?: string[];
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

export interface Postmark {
    messageHash: string;
    incommingTimestamp: number;
    signature: string;
}

export enum MessageState {
    Created,
    Signed,
    Send,
    Read,
    FailedToSend,
}

export interface SendDependencies {
    from: Account;
    to: Account;
    deliveryServiceEncryptionPubKey: string;
    keys: ProfileKeys;
}

export async function submitMessage(
    connection: Connection,
    deliveryServiceToken: string,
    sendDependencies: SendDependencies,
    message: Message,
    submitMessageApi: SubmitMessage,
    encryptAsymmetric: EncryptAsymmetric,
    createPendingEntry: CreatePendingEntry,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Envelop) => void,
) {
    log('Submitting message');

    await createPendingEntry(
        connection,
        deliveryServiceToken,
        message.metadata.from,
        message.metadata.to,
    );

    if (haltDelivery) {
        log('- Halt delivery');
        storeMessages([
            {
                envelop: {
                    message,
                },
                messageState: MessageState.Created,
            },
        ]);
    } else {
        const { envelop, encryptedEnvelop } = await buildEnvelop(
            message,
            encryptAsymmetric,
            sendDependencies,
        );

        const allOnSuccess = () => {
            if (onSuccess) {
                onSuccess(envelop);
            }
        };

        await submitMessageApi(
            connection,
            deliveryServiceToken,
            encryptedEnvelop,
            allOnSuccess,
            () => log('submit message error'),
        );

        storeMessages([{ envelop, messageState: MessageState.Send }]);
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
    deliveryServiceToken: string,
    contact: string,
    getNewMessages: GetNewMessages,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    userDb: UserDB,
): Promise<StorageEnvelopContainer[]> {
    const profile = connection.account?.profile;

    if (!profile) {
        throw 'Account has no profile';
    }
    //Fetch evey delivery service's profie
    const deliveryServices = await Promise.all(
        profile.deliveryServices.map(async (ds) => {
            const deliveryServiceProfile = await getDeliveryServiceProfile(
                ds,
                connection,
                async (url) => (await axios.get(url)).data,
            );
            return deliveryServiceProfile?.url;
        }),
    );

    //Filter every deliveryService without an url
    const deliveryServiceUrls = deliveryServices.filter(
        (ds): ds is string => !!ds,
    );

    //Fetch messages from each deliveryService
    const messages = await Promise.all(
        deliveryServiceUrls.map(async (baseUrl) => {
            return await getNewMessages(
                connection,
                deliveryServiceToken,
                contact,
                baseUrl,
            );
        }),
    );

    //Flatten the message arrays of each delivery service to one message array
    const allMessages = messages.reduce((agg, cur) => [...agg, ...cur]);

    const envelops = await Promise.all(
        allMessages.map(async (envelop): Promise<StorageEnvelopContainer> => {
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
