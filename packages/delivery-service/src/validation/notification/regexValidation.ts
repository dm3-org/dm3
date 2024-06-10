import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

/* eslint-disable max-len */
const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// checks regex pattern for recipient value
export const checkRegexPattern = (
    notificationChannelType: string,
    recipientValue: string,
) => {
    switch (notificationChannelType) {
        case NotificationChannelType.EMAIL:
            // checks regex pattern of email ID
            const patternCheck = String(recipientValue)
                .toLowerCase()
                .match(EMAIL_REGEX);
            return patternCheck;
        case NotificationChannelType.PUSH:
            const data = JSON.parse(recipientValue);
            return !data.endpoint ||
                !data.keys ||
                !data.keys.p256dh ||
                !data.keys.auth
                ? false
                : true;
        default:
            return null;
    }
};
