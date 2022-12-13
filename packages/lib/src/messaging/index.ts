import axios from 'axios';
import stringify from 'safe-stable-stringify';
import { ProfileKeys } from '../account';
import { encryptAsymmetric, sign } from '../crypto';
import { getDeliveryServiceProfile as execGetDeliveryServiceProfile } from '../delivery';
import { getNewMessages } from '../external-apis';
import {
    createPendingEntry,
    submitMessage as backendSubmitMessage,
} from '../external-apis/BackendAPI';
import { StorageEnvelopContainer, UserDB } from '../storage';
import { Connection } from '../web3-provider/Web3Provider';
import { Envelop } from './Envelop';
import {
    getMessages as execGetMessages,
    Message,
    SendDependencies,
    submitMessage as execSubmitMessage,
} from './Message';

export type {
    DeliveryInformation,
    EncryptionEnvelop,
    Envelop,
} from './Envelop';
export { MessageState } from './Message';
export type {
    Message,
    MessageMetadata,
    Postmark,
    SendDependencies,
} from './Message';
export * as schema from './schema';
export { getId } from './Utils';

export async function getMessages(
    connection: Connection,
    deliveryServiceToken: string,
    contact: string,
    userDb: UserDB,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
) {
    const getDeliveryServiceProfile = async (url: string) =>
        await execGetDeliveryServiceProfile(
            url,
            connection,
            async (url) => (await axios.get(url)).data,
        );

    return execGetMessages(
        connection,
        deliveryServiceToken,
        contact,
        getNewMessages,
        storeMessages,
        getDeliveryServiceProfile,
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
