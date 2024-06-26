import {
    DeliveryServiceProfileKeys,
    normalizeEnsName,
    UserProfile,
} from '@dm3-org/dm3-lib-profile';
import {
    IWebSocketManager,
    NotificationChannel,
    stringify,
} from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';

import {
    decryptAsymmetric,
    encryptAsymmetric,
    EncryptedPayload,
    KeyPair,
    sign,
} from '@dm3-org/dm3-lib-crypto';
import {
    DeliveryInformation,
    EncryptionEnvelop,
    getEnvelopSize,
    Postmark,
} from '@dm3-org/dm3-lib-messaging';
import { logDebug, sha256 } from '@dm3-org/dm3-lib-shared';
import { NotificationBroker } from './notifications';
import {
    GetNotificationChannels,
    NotificationType,
} from './notifications/types';
import { Session } from './Session';
import { isSpam } from './spam-filter';
import { SpamFilterRules } from './spam-filter/SpamFilterRules';

export interface Acknoledgment {
    contactAddress: string;
    messageDeliveryServiceTimestamp: number;
}

export function getConversationId(ensNameA: string, ensNameB: string): string {
    return [normalizeEnsName(ensNameA), normalizeEnsName(ensNameB)]
        .sort()
        .join();
}
// fetch new messages
export async function getMessages(
    loadMessages: (
        conversationId: string,
        offset: number,
        size: number,
    ) => Promise<EncryptionEnvelop[]>,
    encryptionKeyPair: KeyPair,
    ensName: string,
    contactEnsName: string,
) {
    const account = normalizeEnsName(ensName);

    const contact = normalizeEnsName(contactEnsName);

    const conversationId = getConversationId(contact, account);

    const receivedMessages: EncryptionEnvelop[] = await loadMessages(
        conversationId,
        0,
        50,
    );

    const envelopContainers = await Promise.all(
        receivedMessages.map(async (envelop) => ({
            to: normalizeEnsName(
                JSON.parse(JSON.stringify(envelop.metadata.deliveryInformation))
                    .to,
            ),
            envelop,
        })),
    );

    return envelopContainers
        .filter((envelopContainer) => envelopContainer.to === account)
        .map((envelopContainer) => envelopContainer.envelop);
}

/**
 * Handles an incoming message.
 * Either stores the message or sends it directly to the receiver if a socketId is provided
 * In order to be considered valid a incoming message has to meet the following criterias
 * 1. The message size must be lower than the sizeLimit specified by the deliveryService {@see messageIsToLarge}
 * 2. The DeliveryServiceToken used by the sender has to be valid
 * 3. The receiver has to have a session at the deliveryService
 * 4. The message must pass every {@see SpamFilterRule} the receiver declared
 */
export async function incomingMessage(
    envelop: EncryptionEnvelop,
    signingKeyPair: KeyPair,
    encryptionKeyPair: KeyPair,
    sizeLimit: number,
    dsNotificationChannels: NotificationChannel[],
    getSession: (
        accountAddress: string,
    ) => Promise<(Session & { spamFilterRules: SpamFilterRules }) | null>,
    storeNewMessage: (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => Promise<void>,
    send: (socketId: string, envelop: EncryptionEnvelop) => void,
    provider: ethers.providers.JsonRpcProvider,
    getIdEnsName: (name: string) => Promise<string>,
    getUsersNotificationChannels: GetNotificationChannels,
    wsManager: IWebSocketManager,
): Promise<void> {
    logDebug('incomingMessage');
    //Checks the size of the incoming message
    if (messageIsTooLarge(envelop, sizeLimit)) {
        throw Error('Message is too large');
    }

    //Decrypts the encrypted DeliveryInformation with the KeyPair of the deliveryService

    const deliveryInformation: DeliveryInformation =
        await decryptDeliveryInformation(envelop, encryptionKeyPair);
    logDebug({ text: 'incomingMessage', deliveryInformation });

    const conversationId = getConversationId(
        await getIdEnsName(deliveryInformation.from),
        await getIdEnsName(deliveryInformation.to),
    );
    logDebug({ text: 'incomingMessage', conversationId, deliveryInformation });

    //Retrieves the session of the receiver
    const receiverSession = await getSession(deliveryInformation.to);
    if (!receiverSession) {
        logDebug({
            text: 'incomingMessage unknown session',
        });
        throw Error('unknown session');
    }
    logDebug({
        text: 'incomingMessage',
        conversationId,
        deliveryInformation,
        receiverSession,
    });

    //Checks if the message is spam
    if (await isSpam(provider, receiverSession, deliveryInformation)) {
        logDebug({
            text: 'incomingMessage is spam',
        });
        throw Error('Message does not match spam criteria');
    }

    const receiverEncryptionKey =
        receiverSession.signedUserProfile.profile.publicEncryptionKey;

    const envelopWithPostmark: EncryptionEnvelop = {
        ...envelop,
        metadata: {
            ...envelop.metadata,
            //Alwaays store the encrypted metadata
            deliveryInformation,
        },
        postmark: stringify(
            await addPostmark(
                envelop,
                receiverEncryptionKey,
                signingKeyPair.privateKey,
            ),
        ),
    };
    logDebug({
        text: 'incomingMessage',
        conversationId,
        envelopWithPostmark,
    });

    if (process.env.DISABLE_MSG_BUFFER !== 'true') {
        logDebug({ text: 'storeNewMessage', conversationId });
        await storeNewMessage(conversationId, envelopWithPostmark);
    } else {
        logDebug({ text: 'skip storeNewMessage', conversationId });
    }

    //If there is currently a webSocket connection open to the receiver, the message will be directly send.
    if (await wsManager.isConnected(deliveryInformation.to)) {
        //Client is already connect to the delivery service and the message can be dispatched
        //TODO MOVE send method to the WebSocketManager
        send(receiverSession.socketId!, envelopWithPostmark);
        logDebug({
            text: 'WS send to socketId ',
            receiverSessionSocketId: receiverSession.socketId,
        });
        //If not we're notifing the user that there is a new message waiting for them
    } else {
        try {
            const { sendNotification } = NotificationBroker(
                dsNotificationChannels,
                NotificationType.NEW_MESSAGE,
            );
            await sendNotification(
                deliveryInformation,
                getUsersNotificationChannels,
            );
        } catch (err) {
            console.log(
                'Unable to send Notification. There might be an error in the config.yml. Message has been received regardless',
            );
            console.error(err);
        }
    }
}

function messageIsTooLarge(
    envelop: EncryptionEnvelop,
    sizeLimit: number,
): boolean {
    return getEnvelopSize(envelop) > sizeLimit;
}

export async function handleIncomingMessage(
    encryptedEnvelop: EncryptionEnvelop,
    deliveryServiceKeys: DeliveryServiceProfileKeys,
    receiverProfile: UserProfile,
): Promise<{
    encryptedEnvelop: Required<EncryptionEnvelop>;
    decryptedDeliveryInformation: DeliveryInformation;
}> {
    const postmark = await addPostmark(
        encryptedEnvelop,
        receiverProfile.publicEncryptionKey,
        deliveryServiceKeys.signingKeyPair.privateKey,
    );
    return {
        encryptedEnvelop: {
            ...encryptedEnvelop,
            postmark: stringify(postmark),
        },
        decryptedDeliveryInformation: await decryptDeliveryInformation(
            encryptedEnvelop,
            deliveryServiceKeys.encryptionKeyPair,
        ),
    };
}

export async function addPostmark(
    { message }: EncryptionEnvelop,
    receiverEncryptionKey: string,
    deliveryServiceSigningKey: string,
): Promise<EncryptedPayload> {
    const postmarkWithoutSig: Omit<Postmark, 'signature'> = {
        messageHash: ethers.utils.hashMessage(stringify(message)),
        incommingTimestamp: new Date().getTime(),
    };

    const signature = await signPostmark(
        postmarkWithoutSig,
        deliveryServiceSigningKey,
    );

    //Encrypte the signed Postmark and return the ciphertext
    const { ciphertext, nonce, ephemPublicKey } = await encryptAsymmetric(
        receiverEncryptionKey,
        stringify({ ...postmarkWithoutSig, signature })!,
    );

    return {
        nonce,
        ciphertext,
        ephemPublicKey,
    };
}

export async function decryptDeliveryInformation(
    encryptedEnvelop: EncryptionEnvelop,
    encryptionKeyPair: KeyPair,
): Promise<DeliveryInformation> {
    return JSON.parse(
        await decryptAsymmetric(
            encryptionKeyPair,
            JSON.parse(encryptedEnvelop.metadata.deliveryInformation as string),
        ),
    );
}

function signPostmark(
    p: Omit<Postmark, 'signature'>,
    signingKey: string,
): Promise<string> {
    const postmarkHash = sha256(stringify(p));
    return sign(signingKey, postmarkHash);
}
