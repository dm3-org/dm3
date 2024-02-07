import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import {
    NotificationBroker,
    NotificationChannel,
    NotificationChannelType,
    NotificationType,
} from './notifications';
import { generateOtp } from './notifications/generateOtp';

// LENGTH of OTP. Ex: 5 digits
const OTP_LENGTH = 5;

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

// method to add new notification channel & send verification OTP
export async function addNewNotificationChannel(
    notificationChannelType: NotificationChannelType,
    recipientValue: string,
    ensName: string,
    dsNotificationChannels: NotificationChannel[],
    getUsersNotificationChannels: (
        ensName: string,
    ) => Promise<NotificationChannel[]>,
    addUsersNotificationChannel: (
        ensName: string,
        channel: NotificationChannel,
    ) => Promise<void>,
    setOtp: (
        ensName: string,
        otp: string,
        channelType: NotificationChannelType,
        generatedAt: Date,
    ) => Promise<void>,
) {
    // Adding a user's notification channel to the database
    await addUsersNotificationChannel(ensName, {
        type: notificationChannelType,
        config: {
            recipientValue: recipientValue,
        },
    });

    // generate and save OTP
    const otp = await saveOtp(notificationChannelType, ensName, setOtp);

    // Filter notification channels to send OTP
    const notificationChannels = await getUsersNotificationChannels(ensName);
    const filteredNotificationChannels = notificationChannels.filter(
        (data) => data.type === notificationChannelType,
    );

    if (!filteredNotificationChannels.length) {
        throw new Error('Invalid notification channel');
    }

    /**
     * This is a mandatory property in sendNotification method so constructed
     * from and to both with same ensname
     */
    const deliveryInformation: DeliveryInformation = {
        from: ensName,
        to: ensName,
    };

    const { sendNotification } = NotificationBroker(
        dsNotificationChannels,
        NotificationType.OTP,
    );

    await sendNotification(
        deliveryInformation,
        getUsersNotificationChannels,
        otp,
    );
}
