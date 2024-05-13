import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import {
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';

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

export type GetNotificationChannels = (
    user: string,
) => Promise<NotificationChannel[]>;

export interface INotificationBroker {
    sendNotification: (
        deliveryInformation: DeliveryInformation,
        getNotificationChannels: GetNotificationChannels,
    ) => Promise<void>;
    sendOtp: (
        ensName: string,
        getNotificationChannels: GetNotificationChannels,
        otpContent: any, // otp for verification and can be some more data in future
    ) => Promise<void>;
}

// An interface for a notification channel.
export interface INotificationChannel {
    type: NotificationChannelType;
    send: (config: any) => void;
}

// user notification configuration
export interface NotificationUserConfig {
    recipientValue: string; // email ID, phone NO, etc....
    isEnabled: boolean;
    isVerified: boolean;
}

export interface IGlobalNotification {
    isEnabled: boolean;
}

export interface IOtp {
    type: NotificationChannelType;
    otp: string;
    generatedAt: Date;
}
