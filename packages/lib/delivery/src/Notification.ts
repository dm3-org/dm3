import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import {
    GetNotificationChannels,
    NotificationBroker,
    NotificationChannelType,
    NotificationType,
} from './notifications';
import { generateOtp } from './notifications/generateOtp';

// LENGTH of OTP. Ex: 5 digits
const OTP_LENGTH = 5;

// method to generate and save email verification OTP
export const generateEmailVerificationNotification = async (
    notificationChannel: NotificationChannelType,
    ensName: string,
    getUsersNotificationChannels: GetNotificationChannels,
    setOtp: (
        ensName: string,
        otp: string,
        channelType: NotificationChannelType,
        generatedAt: Date,
    ) => Promise<void>,
) => {
    // generate and save OTP
    const otp = await saveOtp(notificationChannel, ensName, setOtp);

    // Get all notification channels with otp set to Email channel
    const notificationChannels = await getUsersNotificationChannels(ensName);
    const allNotificationChannels = notificationChannels.map((data) => {
        if (data.type === notificationChannel) data.config.otp = otp;
        return data;
    });

    // get notification broker
    const { sendNotification } = NotificationBroker(
        allNotificationChannels,
        NotificationType.OTP,
    );

    // delivery information
    const deliveryInformation: DeliveryInformation = {
        from: ensName,
        to: ensName,
    };

    // send notification
    await sendNotification(deliveryInformation, getUsersNotificationChannels);
};

// method to save OTP in Redis
export const saveOtp = async (
    channelType: NotificationChannelType,
    ensName: string,
    setOtp: (
        ensName: string,
        otp: string,
        channelType: NotificationChannelType,
        generatedAt: Date,
    ) => Promise<void>,
): Promise<string> => {
    // generate OTP
    const otp = generateOtp(OTP_LENGTH);
    // save in Redis
    await setOtp(ensName, otp, channelType, new Date());
    // return OTP
    return otp;
};
