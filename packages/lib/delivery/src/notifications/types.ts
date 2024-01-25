import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';

//Every notification channel that is supported by the delivery service must be listed here
export enum NotificationChannelType {
    EMAIL = 'EMAIL',
}

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

// user notification configuration
export interface NotificationUserConfig {
    recipientValue: string; // email ID, phone NO, etc....
    isEnabled: boolean;
    isVerified: boolean;
}
