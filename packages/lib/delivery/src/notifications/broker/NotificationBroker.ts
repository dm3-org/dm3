import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import { Email } from '../channels/Email';
import {
    INotificationBroker,
    GetNotificationChannels,
    NotificationChannel,
    NotificationChannelType,
    INotificationChannel,
    NotificationType,
} from '../types';

/**
 * Sets up the notification broker with supported notification channels.
 * Separated from the NotificationBroker function to make it testable.
 * @param {INotificationChannel[]} supportedChannels - List of supported notification channels by the deliveryService.
 * @returns {INotificationBroker} Object with a method to send notifications.
 */
export const _setupNotficationBroker = (
    supportedChannels: INotificationChannel[],
    notificationType: NotificationType,
): INotificationBroker => {
    async function sendNotification(
        deliveryInformation: DeliveryInformation,
        getNotificationChannels: GetNotificationChannels,
        mailContent?: any,
    ) {
        //Get users notification channels from DB
        const usersNotificationChannels = await getNotificationChannels(
            deliveryInformation.to,
        );

        // Send OTP to specific notification channel only
        if (notificationType === NotificationType.OTP) {
            // fetch the channel to which OTP is to be send
            const filteredChannel = usersNotificationChannels.filter(
                (channel) => channel.type === supportedChannels[0].type,
            );
            // fetch the delivery service
            const deliveryServiceNotificationChannel = supportedChannels.find(
                (c) => c.type === filteredChannel[0].type,
            );
            if (deliveryServiceNotificationChannel) {
                return await deliveryServiceNotificationChannel.send(
                    {
                        recipientValue:
                            filteredChannel[0].config.recipientValue,
                        notificationType: notificationType,
                        mailContent: mailContent, // otp
                    },
                    deliveryInformation,
                );
            }
        } else {
            // Send message notification to all active channels
            await Promise.all(
                usersNotificationChannels.map(async (channel) => {
                    const deliveryServiceNotificationChannel =
                        supportedChannels.find((c) => c.type === channel.type);
                    //User specified a channel that is not supported
                    if (!deliveryServiceNotificationChannel) {
                        throw new Error(
                            `Channel type ${channel.type} is not supported`,
                        );
                    } else if (
                        channel.config.isEnabled &&
                        channel.config.isVerified
                    ) {
                        return await deliveryServiceNotificationChannel.send(
                            {
                                recipientValue: channel.config.recipientValue,
                                notificationType: notificationType,
                            },
                            deliveryInformation,
                        );
                    }
                }),
            );
        }
    }

    return { sendNotification };
};

/**
 * Creates a notification broker based on the provided notification channels.
 * @param {NotificationChannel[]} notificationChannel - All notification channels of a delivery service.
 * @param {NotificationType} notificationType - Specifies type of notifications like : New message , OTP etc..
 * @returns {INotificationBroker} An instance of the notification broker.
 * @throws {Error} If an unsupported channel type is encountered.
 */
export const NotificationBroker = (
    notificationChannel: NotificationChannel[],
    notificationType: NotificationType,
): INotificationBroker => {
    const channels = notificationChannel.map((channel) => {
        switch (channel.type) {
            case NotificationChannelType.EMAIL:
                channel.config.notificationType = notificationType;
                return {
                    type: NotificationChannelType.EMAIL,
                    send: Email(channel.config).send,
                };
            default:
                throw new Error(
                    `Channel type ${channel.type} is not supported`,
                );
        }
    });

    return _setupNotficationBroker(channels, notificationType);
};
