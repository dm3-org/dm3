import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import { checkRegexPattern } from './regexValidation';

// validates notification channel type
export const validateNotificationChannelType = (
    notificationChannelType: string,
): {
    isValid: boolean;
    errorMessage?: string;
} => {
    try {
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

// validates new notification channel data to be added
export const validateNewNotificationChannelData = (
    notificationChannelType: string,
    recipientValue: string,
): {
    isValid: boolean;
    errorMessage?: string;
} => {
    try {
        // validate notification channel type
        const isChannelValid = validateNotificationChannelType(
            notificationChannelType,
        );

        // return error if channel type is not valid
        if (!isChannelValid.isValid) {
            return isChannelValid;
        }

        // throw error if recipient value not found
        if (!recipientValue) {
            throw new Error('Recipient value is missing');
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
