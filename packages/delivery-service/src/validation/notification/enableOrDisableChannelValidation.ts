import { validateNotificationChannelType } from './notificationChannelValidation';

// validates enable/disable notification channel data
export const validateToggleNotificationChannel = (
    notificationChannelType: string,
    isEnabled: boolean,
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

        // throw error if isEnabled not found
        if (isEnabled !== false && !isEnabled) {
            throw new Error('isEnabled value is missing');
        }

        // check isEnabled is a boolean value
        if (typeof isEnabled !== 'boolean') {
            throw new Error('isEnabled must have boolean value');
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
