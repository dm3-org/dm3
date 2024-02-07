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
    db: any,
) {
    // check if channel is supported or not
    const channelUsed = dsNotificationChannels.filter(
        (channel) => channel.type === notificationChannelType,
    );

    if (!channelUsed.length) {
        throw Error('Notification channel not supported');
    }

    // Adding a user's notification channel to the database
    await db.addUsersNotificationChannel(ensName, {
        type: notificationChannelType,
        config: {
            recipientValue: recipientValue,
        },
    });

    // generate and save OTP
    const otp = await saveOtp(notificationChannelType, ensName, db.setOtp);

    // set up notification broker
    const { sendOtp } = NotificationBroker(
        dsNotificationChannels,
        NotificationType.OTP,
    );

    // send otp
    await sendOtp(
        ensName,
        db.getUsersNotificationChannels,
        getOtpContentForNotificationChannel(channelUsed[0], otp),
    );
}

// Method to fetch otp content to send to specific channel which can vary for each type
const getOtpContentForNotificationChannel = (
    notificationChannel: NotificationChannel,
    otp: string,
) => {
    switch (notificationChannel.type) {
        case NotificationChannelType.EMAIL:
            return {
                otp: otp,
                dm3ContactEmailID: notificationChannel.config.smtpEmail,
            };
        default:
            throw Error(
                `Invalid notification channel ${notificationChannel.type}`,
            );
    }
};
