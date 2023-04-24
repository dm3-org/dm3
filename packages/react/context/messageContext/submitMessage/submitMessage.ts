import {
    Envelop,
    Message,
    MessageState,
    SendDependencies,
    buildEnvelop,
} from 'dm3-lib-messaging';
import { createPendingEntry } from '../../../api/ws/createPendingEntry';
import { sendMessage } from '../../../api/ws/submitMessage';
import { Connection } from '../../../src/web3provider/Web3Provider';
import { StorageEnvelopContainer } from 'dm3-lib-storage';
import { log } from 'dm3-lib-shared';
import { encryptAsymmetric } from 'dm3-lib-crypto';

export async function submitMessage(
    connection: Connection,
    deliveryServiceToken: string,
    sendDependencies: SendDependencies,
    message: Message,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Envelop) => void,
) {
    log('Submitting message');
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
        log('- Halt delivery');
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
        () => log('submit message error'),
    );

    storeMessages([{ envelop, messageState: MessageState.Send }]);
    log('- Message sent');
}

export type SubmitMessageType = typeof submitMessage;
