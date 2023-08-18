/* eslint-disable max-len */
import { DeliveryInformation } from 'dm3-lib-messaging';
import { Email } from './channels/Email';
import {
    GetNotificationChannels,
    INotificationBroker,
    NotificationChannel,
    NotifificationChannelType,
} from './types';

// An interface for a notification channel.
interface INotificationChannel {
    type: NotifificationChannelType;
    send: (config: any, deliveryInformation: DeliveryInformation) => void;
}

/**
 * Sets up the notification broker with supported notification channels.
 * Separated from the NotificationBroker function to make it testable.
 * @param {INotificationChannel[]} supportedChannels - List of supported notification channels by the deliveryService.
 * @returns {INotificationBroker} Object with a method to send notifications.
 */
export const _setupNotficationBroker = (
    supportedChannels: INotificationChannel[],
): INotificationBroker => {
    async function sendNotification(
        deliveryInformation: DeliveryInformation,
        getNotificationChannels: GetNotificationChannels,
    ) {
        //Get users notification channels from DB
        const usersNotificationChannels = await getNotificationChannels(
            deliveryInformation.to,
        );

        await Promise.all(
            usersNotificationChannels.map(async (channel) => {
                const deliveryServiceNotificationChannel =
                    supportedChannels.find((c) => c.type === channel.type);
                //User specified a channel that is not supported.
                //This should be prevented by refusing any schema that allows to provide a channel that is not supported
                if (!deliveryServiceNotificationChannel) {
                    throw new Error(
                        `Channel type ${channel.type} is not supported`,
                    );
                }
                return await deliveryServiceNotificationChannel.send(
                    channel.config,
                    deliveryInformation,
                );
            }),
        );
    }
    return { sendNotification };
};

/**
 * Creates a notification broker based on the provided notification channels.
 * @param {DeliveryServiceProperties} options - Delivery service properties including notification channels.
 * @returns {INotificationBroker} An instance of the notification broker.
 * @throws {Error} If an unsupported channel type is encountered.
 */
export const NotificationBroker = (
    notificationChannel: NotificationChannel[],
): INotificationBroker => {
    const channels = notificationChannel.map((channel) => {
        switch (channel.type) {
            case NotifificationChannelType.EMAIL:
                return {
                    type: NotifificationChannelType.EMAIL,
                    send: Email(channel.config).send,
                };
            default:
                throw new Error(
                    `Channel type ${channel.type} is not supported`,
                );
        }
    });

    return _setupNotficationBroker(channels);
};

export * from './types';
