import { NotificationChannelType } from '@dm3-org/dm3-lib-delivery';
import { checkRegexPattern } from './regexValidation';

// validates notification channel type & recipient value
export const validateNotificationChannel = (
    notificationChannelType: string,
    recipientValue: string,
): {
    isValid: boolean;
    errorMessage?: string;
} => {
    try {
        // throw error if recipient value not found
        if (!recipientValue) {
            throw new Error('Recipient value is missing');
        }

        // throw error if notification channel type not found
        if (!notificationChannelType) {
            throw new Error('Notification Channel Type is missing');
        }

        // fetch supported notification channel types
        const channelTypeCheck = Object.values(
            NotificationChannelType,
        ).includes(notificationChannelType as NotificationChannelType);

        // throw error if notification channel type is invalid
        if (!channelTypeCheck) {
            throw new Error('Invalid notification channel type');
        }

        // check regex pattern of provided value
        const regexCheck = checkRegexPattern(
            notificationChannelType,
            recipientValue,
        );

        // throw error if value is invalid
        if (!regexCheck) {
            throw new Error(
                `Invalid ${notificationChannelType.toLowerCase()} value`,
            );
        }

        return {
            isValid: true,
        };
    } catch (error: any) {
        // return with error message
        return {
            isValid: false,
            errorMessage: error.message,
        };
    }
};
