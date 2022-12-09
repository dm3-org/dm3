import { Account, ProfileKeys } from '../account';
import { getNewMessages } from '../external-apis';
import { StorageEnvelopContainer, UserDB } from '../storage';
import { Connection } from '../web3-provider/Web3Provider';
import {
    Envelop,
    getMessages as execGetMessages,
    Message,
    SendDependencies,
    submitMessage as execSubmitMessage,
} from './Messaging';
import {
    createPendingEntry,
    submitMessage as backendSubmitMessage,
} from '../external-apis/BackendAPI';
import { encryptAsymmetric, sign } from '../crypto';
import stringify from 'safe-stable-stringify';

export type {
    Message,
    EncryptionEnvelop,
    Envelop,
    DeliveryInformation,
    Postmark,
    MessageMetadata,
    SendDependencies,
} from './Messaging';

export { MessageState } from './Messaging';
export { getId } from './Utils';

export * as schema from './schema';

export async function getMessages(
    connection: Connection,
    deliveryServiceToken: string,
    contact: string,
    userDb: UserDB,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
) {
    return execGetMessages(
        connection,
        deliveryServiceToken,
        contact,
        getNewMessages,
        storeMessages,
        userDb,
    );
}

export async function submitMessage(
    connection: Connection,
    deliveryServiceToken: string,
    message: Message,
    sendDependencies: SendDependencies,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Envelop) => void,
) {
    execSubmitMessage(
        connection,
        deliveryServiceToken,
        sendDependencies,
        message,
        backendSubmitMessage,
        encryptAsymmetric,
        createPendingEntry,
        haltDelivery,
        storeMessages,
        onSuccess,
    );
}

export async function createMessage(
    to: string,
    from: string,
    message: string,
    userDb: UserDB,
): Promise<Message> {
    const messgeWithoutSig: Omit<Message, 'signature'> = {
        message,
        metadata: {
            type: 'NEW',
            to,
            from,
            timestamp: new Date().getTime(),
        },
    };

    return {
        ...messgeWithoutSig,
        signature: await sign(
            (userDb?.keys as ProfileKeys).signingKeyPair.privateKey,
            stringify(messgeWithoutSig),
        ),
    };
}
