import { ChannelNotSupportedError } from './errors/ChannelNotSupportedError';
import {
    NotificationBroker,
    NotificationChannel,
    NotificationChannelType,
    NotificationType,
} from './notifications';
import { generateOtp } from './notifications/generateOtp';

// LENGTH of OTP. Ex: 5 digits
const OTP_LENGTH = 5;

// resend OTP time period in seconds
export const RESEND_VERIFICATION_OTP_TIME_PERIOD = 0; // 0 minute

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
        throw new ChannelNotSupportedError(
            'Notification channel not supported',
        );
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

// method to fetch otp content to send to specific channel which can vary for each type
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
            throw new ChannelNotSupportedError(
                `Invalid notification channel ${notificationChannel.type}`,
            );
    }
};

// method to resend otp
export const resendOtp = async (
    ensName: string,
    notificationChannelType: NotificationChannelType,
    dsNotificationChannels: NotificationChannel[],
    db: any,
) => {
    // check if channel is supported or not
    const channelUsed = dsNotificationChannels.filter(
        (channel) => channel.type === notificationChannelType,
    );

    if (!channelUsed.length) {
        throw Error('Notification channel not supported');
    }

    // check if notification channel exists in DB
    const userNotificationChannels: NotificationChannel[] =
        await db.getUsersNotificationChannels(ensName);

    const channelToSendOtp = userNotificationChannels.filter(
        (data) => data.type === notificationChannelType,
    );

    if (!channelToSendOtp.length) {
        throw Error(
            `${notificationChannelType} notification channel is not configured`,
        );
    }

    // throws error if notification channel is not enabled or already verfiied
    checkNotificationIsEnabledAndNotVerified(
        channelToSendOtp[0],
        notificationChannelType,
    );

    // fetch existing otp data from Redis
    const existingOtp = await db.getOtp(ensName, notificationChannelType);

    // check if new OTP can be sent based on time period set for new OTP
    if (existingOtp && !isAllowedtoSendNewOtp(existingOtp.generatedAt)) {
        throw Error(
            `New OTP can be generated after ${
                RESEND_VERIFICATION_OTP_TIME_PERIOD / 10
            } minutes of last OTP genarted`,
        );
    }

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
};

// checks notification channel is enabled and verfiied or not
const checkNotificationIsEnabledAndNotVerified = (
    notificationChannel: NotificationChannel,
    notificationChannelType: NotificationChannelType,
) => {
    if (!notificationChannel.config.isEnabled) {
        throw Error(
            `${notificationChannelType} notification channel is not enabled`,
        );
    }
    if (notificationChannel.config.isVerified) {
        throw Error(
            `${notificationChannelType} notification channel is already verified`,
        );
    }
};

/**
 *  checks existing otp generated time should have difference of
 *  RESEND_VERIFICATION_OTP_TIME_PERIOD from current time
 */
const isAllowedtoSendNewOtp = (otpGeneratedAtTime: Date): boolean => {
    return (
        new Date().getTime() >=
        otpGeneratedAtTime.getTime() + RESEND_VERIFICATION_OTP_TIME_PERIOD
    );
};
