import { NotificationChannelType } from '@dm3-org/dm3-lib-delivery';

// checks regex pattern for recipient value
export const checkRegexPattern = (
    notificationChannelType: string,
    recipientValue: string,
): boolean => {
    switch (notificationChannelType) {
        case NotificationChannelType.EMAIL:
            // checks regex pattern of email ID
            const patternCheck = String(recipientValue)
                .toLowerCase()
                .match(
                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                );
            return patternCheck ? true : false;
        default:
            return false;
    }
};
