import { DeliveryServiceProfileKeys } from '@dm3-org/dm3-lib-profile';
import { IWebSocketManager, stringify } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';

import {
    addPostmark,
    decryptDeliveryInformation,
    DeliveryServiceProperties,
    getConversationId,
    NotificationBroker,
    NotificationType,
} from '@dm3-org/dm3-lib-delivery';
import { spamFilter } from '@dm3-org/dm3-lib-delivery';
import {
    DeliveryInformation,
    EncryptionEnvelop,
    getEnvelopSize,
} from '@dm3-org/dm3-lib-messaging';
import { logDebug } from '@dm3-org/dm3-lib-shared';
import { IDatabase } from '../persistence/getDatabase';

type onSubmitMessage = (socketId: string, envelop: EncryptionEnvelop) => void;

export class MessageProcessor {
    private readonly db: IDatabase;
    private readonly provider: ethers.providers.JsonRpcProvider;
    private readonly webSocketManager: IWebSocketManager;
    private readonly deliveryServiceProperties: DeliveryServiceProperties;
    private readonly deliveryServiceProfileKeys: DeliveryServiceProfileKeys;
    private readonly onSubmitMessage: onSubmitMessage;

    constructor(
        db: IDatabase,
        provider: ethers.providers.JsonRpcProvider,
        webSocketManager: IWebSocketManager,
        deliveryServiceProperties: DeliveryServiceProperties,
        deliveryServiceProfileKeys: DeliveryServiceProfileKeys,
        onSubmitMessage: onSubmitMessage,
    ) {
        this.db = db;
        this.provider = provider;
        this.webSocketManager = webSocketManager;
        this.deliveryServiceProperties = deliveryServiceProperties;
        this.deliveryServiceProfileKeys = deliveryServiceProfileKeys;
        this.onSubmitMessage = onSubmitMessage;
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
    public async processEnvelop(envelop: EncryptionEnvelop): Promise<void> {
        logDebug('incomingMessage');
        //Checks the size of the incoming message
        if (
            this.messageIsTooLarge(
                envelop,
                this.deliveryServiceProperties.sizeLimit,
            )
        ) {
            throw Error('Message is too large');
        }

        //Decrypts the encryptryInformation with the KeyPair of the deliveryService

        const deliveryInformation: DeliveryInformation =
            await decryptDeliveryInformation(
                envelop,
                this.deliveryServiceProfileKeys.encryptionKeyPair,
            );
        console.debug('incomingMessage', deliveryInformation);

        const conversationId = getConversationId(
            //TODO look into dbIdEnsName
            await this.db.getIdEnsName(deliveryInformation.from),
            await this.db.getIdEnsName(deliveryInformation.to),
        );
        console.debug(conversationId, deliveryInformation);

        //Retrieves the session of the receiver
        const receiverSession = await this.db.getSession(
            deliveryInformation.to,
        );
        if (!receiverSession) {
            console.debug('unknown user ', deliveryInformation.to);
            throw Error('unknown session');
        }

        //Checks if the message is spam
        if (
            await spamFilter.isSpam(
                this.provider,
                receiverSession,
                deliveryInformation,
            )
        ) {
            console.debug(
                `incomingMessage fro ${deliveryInformation.to} is spam`,
            );
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
                    this.deliveryServiceProfileKeys.signingKeyPair.privateKey,
                ),
            ),
        };

        if (process.env.DISABLE_MSG_BUFFER !== 'true') {
            console.debug('storeNewMessage', conversationId);
            await this.db.createMessage(conversationId, envelopWithPostmark);
        } else {
            console.debug('skip storeNewMessage', conversationId);
        }

        //If there is currently a webSocket connection open to the receiver, the message will be directly send.
        if (await this.webSocketManager.isConnected(deliveryInformation.to)) {
            //Client is already connect to the delivery service and the message can be dispatched
            //TODO MOVE send method to the WebSocketManager
            this.onSubmitMessage(
                receiverSession.socketId!,
                envelopWithPostmark,
            );

            console.debug('WS send to socketId ', receiverSession.socketId);
            //If not we're notifing the user that there is a new message waiting for them
        } else {
            try {
                const { sendNotification } = NotificationBroker(
                    this.deliveryServiceProperties.notificationChannel,
                    NotificationType.NEW_MESSAGE,
                );
                await sendNotification(
                    deliveryInformation,
                    this.db.getUsersNotificationChannels,
                );
            } catch (err) {
                console.log(
                    'Unable to send Notification. There might be an error in the config.yml. Message has been received regardless',
                );
                console.error(err);
            }
        }
    }

    private messageIsTooLarge(envelop: EncryptionEnvelop, sizeLimit: number) {
        return getEnvelopSize(envelop) > sizeLimit;
    }
}
