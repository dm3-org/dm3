import axios from 'axios';
import { encryptAsymmetric } from 'dm3-lib-crypto';
import {
    SendDependencies,
    Message,
    Envelop,
    MessageState,
    buildEnvelop,
    EncryptionEnvelop,
} from 'dm3-lib-messaging';
import {
    Account,
    getDeliveryServiceClient,
    getDeliveryServiceProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import {
    StorageEnvelopContainer,
    UserDB,
    getConversation,
} from 'dm3-lib-storage';
import { Connection } from '../interfaces/web3';
import { withAuthHeader } from './auth';
import { decryptAsymmetric } from 'dm3-lib-crypto';

export async function fetchPendingConversations(
    connection: Connection,
    token: string,
): Promise<string[]> {
    const { account } = connection;

    const deliveryPath = process.env.REACT_APP_BACKEND + '/delivery';
    const url = `${deliveryPath}/messages/${account?.ensName!}/pending/`;

    const { data } = await getDeliveryServiceClient(
        connection.account?.profile!,
        connection.provider!,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, {}, withAuthHeader(token));

    return data;
}

export async function submitMessage(
    connection: Connection,
    deliveryServiceToken: string,
    sendDependencies: SendDependencies,
    message: Message,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Envelop) => void,
) {
    log('Submitting message', 'info');
    /*
     * A Pending entry indicates the receiver that there is a new message
     * for them
     */
    await createPendingEntry(
        connection,
        deliveryServiceToken,
        message.metadata.from,
        message.metadata.to,
        () => {},
        () => {},
    );
    /**
     * The client can halt the delivry of a message if the receiver has no dm3-profile yet.
     * In this case the message will be stored at the senders deliveryService until the reciver
     * has created themself a profile
     */
    if (haltDelivery) {
        log('- Halt delivery', 'info');
        storeMessages([
            {
                envelop: {
                    message,
                },
                messageState: MessageState.Created,
            },
        ]);
        return;
    }
    /**
     * Encrypts the message using the deliveryService' encryptionKey
     */
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
    /**
     * Dispatching the message to the deliveryService using an API i.E an existng webSocket connecion
     */
    await sendMessage(
        connection,
        deliveryServiceToken,
        encryptedEnvelop,
        allOnSuccess,
        () => log('submit message error', 'info'),
    );

    storeMessages([{ envelop, messageState: MessageState.Send }]);
    log('- Message sent', 'info');
}

export async function createPendingEntry(
    connection: Connection,
    token: string,
    ensName: string,
    contactEnsName: string,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        log(`Create pending entry`, 'info');
        connection.socket.emit(
            'pendingMessage',
            {
                ensName,
                contactEnsName,
                token,
            },
            (result: any) => {
                if (result.response === 'success') {
                    log(`Create pending entry: success`, 'info');
                    onSuccess();
                } else {
                    log(`Create pending entry: error`, 'error');
                    onError();
                }
            },
        );
    }
}

export async function sendMessage(
    connection: Connection,
    token: string,
    envelop: Envelop | EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (!connection.socket) {
        return;
    }
    connection.socket.emit(
        'submitMessage',
        {
            envelop,
            token,
        },
        (result: any) => {
            if (result.response === 'success') {
                log(`[sendMessage] success`, 'info');
                onSuccess();
            } else {
                log(`[sendMessage] error `, 'error');
                onError();
            }
        },
    );
}

export async function fetchAndStoreMessages(
    connection: Connection,
    deliveryServiceToken: string,
    contact: string,
    userDb: UserDB,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    contacts: Account[],
): Promise<StorageEnvelopContainer[]> {
    const profile = connection.account?.profile;

    if (!profile) {
        throw Error('Account has no profile');
    }
    //Fetch evey delivery service's profie
    const deliveryServices = await Promise.all(
        profile.deliveryServices.map(async (ds) => {
            const deliveryServiceProfile = await getDeliveryServiceProfile(
                ds,
                connection.provider!,
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
            return await fetchNewMessages(
                connection,
                deliveryServiceToken,
                contact,
            );
        }),
    );

    //Flatten the message arrays of each delivery service to one message array
    const allMessages = messages.reduce((agg, cur) => [...agg, ...cur], []);
    const isFulfilled = <T>(
        p: PromiseSettledResult<T>,
    ): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';

    const envelops = (
        await Promise.allSettled(
            /**
             * Decrypts every message using the receivers encryptionKey
             */
            allMessages.map(
                async (envelop: any): Promise<StorageEnvelopContainer> => {
                    const decryptedEnvelop = await decryptMessages(
                        [envelop],
                        userDb,
                    );

                    return {
                        envelop: decryptedEnvelop[0],
                        messageState: MessageState.Send,
                        deliveryServiceIncommingTimestamp:
                            decryptedEnvelop[0].postmark?.incommingTimestamp,
                    };
                },
            ),
        )
    )
        .filter(isFulfilled)
        .map((settledResult) => settledResult.value);

    //Storing the newly fetched messages in the userDb
    storeMessages(envelops);

    //Return all messages from the conversation between the user and their contact
    return getConversation(contact, contacts, userDb);
}

async function decryptMessages(
    envelops: EncryptionEnvelop[],
    userDb: UserDB,
): Promise<Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Envelop> => ({
                message: JSON.parse(
                    await decryptAsymmetric(
                        userDb.keys.encryptionKeyPair,
                        JSON.parse(envelop.message),
                    ),
                ),
                postmark: JSON.parse(
                    await decryptAsymmetric(
                        userDb.keys.encryptionKeyPair,
                        JSON.parse(envelop.postmark!),
                    ),
                ),
                metadata: envelop.metadata,
            }),
        ),
    );
}

export async function fetchNewMessages(
    connection: Connection,
    token: string,
    contactAddress: string,
): Promise<EncryptionEnvelop[]> {
    const { account } = connection;
    const deliveryPath = process.env.REACT_APP_BACKEND + '/delivery';
    const url = `${deliveryPath}/messages/${normalizeEnsName(
        account!.ensName,
    )}/contact/${contactAddress}`;

    const { data } = await getDeliveryServiceClient(
        account!.profile!,
        connection.provider!,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, withAuthHeader(token));

    return data;
}

export type SendMessage = typeof sendMessage;
export type SubmitMessageType = typeof submitMessage;
export type GetNewMessages = typeof fetchNewMessages;
export type CreatePendingEntry = typeof createPendingEntry;
export type FetchAndStoreMessages = typeof fetchAndStoreMessages;
export type FetchPendingConversations = typeof fetchPendingConversations;
