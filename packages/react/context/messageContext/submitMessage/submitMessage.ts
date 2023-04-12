import * as Lib from 'dm3-lib';
import { createPendingEntry } from '../../../api/ws/createPendingEntry';
import { sendMessage } from '../../../api/ws/submitMessage';

export async function submitMessage(
    connection: Lib.Connection,
    deliveryServiceToken: string,
    sendDependencies: Lib.messaging.SendDependencies,
    message: Lib.messaging.Message,
    haltDelivery: boolean,
    storeMessages: (envelops: Lib.storage.StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Lib.messaging.Envelop) => void,
) {
    Lib.log('Submitting message');
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
        Lib.log('- Halt delivery');
        storeMessages([
            {
                envelop: {
                    message,
                },
                messageState: Lib.messaging.MessageState.Created,
            },
        ]);
        return;
    }
    /**
     * Encrypts the message using the deliveryService' encryptionKey
     */
    const { envelop, encryptedEnvelop } = await Lib.messaging.buildEnvelop(
        message,
        Lib.crypto.encryptAsymmetric,
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
        () => Lib.log('submit message error'),
    );

    storeMessages([{ envelop, messageState: Lib.messaging.MessageState.Send }]);
    Lib.log('- Message sent');
}

export type SubmitMessageType = typeof submitMessage;
