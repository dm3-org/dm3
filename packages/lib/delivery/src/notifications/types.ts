import { DeliveryInformation } from 'dm3-lib-messaging';

//Every notification channel that is supported by the delivery service must be listed here
export enum NotifificationChannelType {
    EMAIL = 'EMAIL',
}

//The properties of a notification channel.
// Those properties are stored in the DB to let the user specify their notificatin channels
export interface NotificatationChannelProperties {
    type: NotifificationChannelType;
    config: any;
}

// An interface for a notification channel.
export interface INotificationChannel {
    type: NotifificationChannelType;
    send: (config: any, deliveryInformation: DeliveryInformation) => void;
}

export type GetNotificationChannels = (
    user: string,
) => Promise<NotificatationChannelProperties[]>;

export interface INotificationBroker {
    sendNotification: (
        deliveryInformation: DeliveryInformation,
        getNotificationChannels: GetNotificationChannels,
    ) => Promise<void>;
}
