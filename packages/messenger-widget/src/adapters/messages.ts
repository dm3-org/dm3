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
import { getDeliveryServiceClient } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import { StorageEnvelopContainer } from 'dm3-lib-storage';
import { Connection } from '../interfaces/web3';
import { withAuthHeader } from './auth';

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

export type SendMessage = typeof sendMessage;
export type CreatePendingEntry = typeof createPendingEntry;
export type SubmitMessageType = typeof submitMessage;
export type FetchPendingConversations = typeof fetchPendingConversations;
