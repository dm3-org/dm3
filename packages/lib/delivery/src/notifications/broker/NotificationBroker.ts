import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import { Email } from '../channels/Email';
import {
    INotificationBroker,
    GetNotificationChannels,
    INotificationChannel,
    NotificationType,
} from '../types';
import { NotificationError } from '../../errors/NotificationError';
import {
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';
import { Push } from '../channels/Push';

/**
 * Sets up the notification broker with supported notification channels.
 * Separated from the NotificationBroker function to make it testable.
 * @param {INotificationChannel[]} supportedChannels - List of supported notification channels by the deliveryService.
 * @returns {INotificationBroker} Object with a method to send notifications.
 */
export const _setupNotficationBroker = (
    supportedChannels: INotificationChannel[],
): INotificationBroker => {
    // Method to send notification for new message
    async function sendNotification(
        deliveryInformation: DeliveryInformation,
        getNotificationChannels: GetNotificationChannels,
    ) {
        //Get users notification channels from DB
        const usersNotificationChannels = await getNotificationChannels(
            deliveryInformation.to,
        );

        // Send message notification to all active channels
        await Promise.all(
            usersNotificationChannels.map(async (channel) => {
                const deliveryServiceNotificationChannel =
                    supportedChannels.find((c) => c.type === channel.type);
                console.log(
                    'deliveryServiceNotificationChannel : ',
                    deliveryServiceNotificationChannel,
                    usersNotificationChannels,
                );
                //User specified a channel that is not supported
                if (!deliveryServiceNotificationChannel) {
                    throw new NotificationError(
                        `Notification channel ${channel.type} is currently not supported by the DS`,
                    );
                }
                // Send notification only if channel is verified
                if (channel.config.isEnabled && channel.config.isVerified) {
                    return await deliveryServiceNotificationChannel.send({
                        recipientValue: channel.config.recipientValue,
                        notificationType: NotificationType.NEW_MESSAGE,
                        notificationContent: deliveryInformation,
                    });
                }
            }),
        );
    }

    // Method to send notification for OTP
    async function sendOtp(
        ensName: string,
        getNotificationChannels: GetNotificationChannels,
        otpContent: any,
    ) {
        //Get users notification channels from DB
        const usersNotificationChannels = await getNotificationChannels(
            ensName,
        );

        // fetch the channel to which OTP is to be send
        const filteredChannel = usersNotificationChannels.filter(
            (channel) => channel.type === supportedChannels[0].type,
        );

        // fetch the delivery service
        const deliveryServiceNotificationChannel = supportedChannels.find(
            (c) => c.type === filteredChannel[0].type,
        );

        console.log(
            'deliveryServiceNotificationChannel filtered : ',
            deliveryServiceNotificationChannel,
            supportedChannels,
        );

        if (!deliveryServiceNotificationChannel) {
            throw new NotificationError(
                `Notification channel ${filteredChannel[0].type} is currently not supported by the DS`,
            );
        } else {
            return await deliveryServiceNotificationChannel.send({
                recipientValue: filteredChannel[0].config.recipientValue,
                notificationType: NotificationType.OTP,
                notificationContent: otpContent, // contains otp to send & dm3ContactEmailID
            });
        }
    }
    return { sendNotification, sendOtp };
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
        channel.config.notificationType = notificationType;
        console.log('channel data is : ', channel);
        switch (channel.type) {
            case NotificationChannelType.EMAIL:
                return {
                    type: NotificationChannelType.EMAIL,
                    send: Email(channel.config).send,
                };
            case NotificationChannelType.PUSH:
                return {
                    type: NotificationChannelType.PUSH,
                    send: Push().send,
                };
            default:
                throw new NotificationError(
                    `Notification channel ${channel.type} is currently not supported by the DS`,
                );
        }
    });

    return _setupNotficationBroker(channels);
};
