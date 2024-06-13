/**
 * Every notification channel that is supported by the delivery service must be listed here
 * Notification channel is medium of getting notified. It can be email, phone no. push notification etc...
 */
export enum NotificationChannelType {
    EMAIL = 'EMAIL',
    PUSH = 'PUSH',
}

// The properties of a notification channel.
// Those properties are stored in the DB to let the user specify their notificatin channels
export interface NotificationChannel {
    type: NotificationChannelType;
    config: any;
}
