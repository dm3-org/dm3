import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';

//Every notification channel that is supported by the delivery service must be listed here
// Notification channel is medium of getting notified. It can be email, phone no. push notification etc...
export enum NotificationChannelType {
    EMAIL = 'EMAIL',
}

/**
 * Notification type describes which kind of notification it is :
 * 1. New Message
 * 2. Verification OTP
 * etc...
 */
export enum NotificationType {
    NEW_MESSAGE = 'NEW_MESSAGE',
    OTP = 'OTP',
}

//The properties of a notification channel.
// Those properties are stored in the DB to let the user specify their notificatin channels
export interface NotificationChannel {
    type: NotificationChannelType;
    config: any;
}
export type GetNotificationChannels = (
    user: string,
) => Promise<NotificationChannel[]>;

export interface INotificationBroker {
    sendNotification: (
        deliveryInformation: DeliveryInformation,
        getNotificationChannels: GetNotificationChannels,
    ) => Promise<void>;
}

// An interface for a notification channel.
export interface INotificationChannel {
    type: NotificationChannelType;
    send: (config: any, deliveryInformation: DeliveryInformation) => void;
}
