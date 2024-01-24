import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import { NotificationType } from './types';
import {
    NEW_MSG_EMAIL_SUBJECT,
    NEW_MSG_EMAIL_TEMPLATE,
} from './templates/newMessage';
import { OTP_EMAIL_SUBJECT, OTP_EMAIL_TEMPLATE } from './templates/otp';
import { generateOtp } from './generateOtp';

// to fetch subject & template of email based on notification type
export const fetchEmailSubjectAndTemplate = (
    notificationType: NotificationType,
    deliveryInformation: DeliveryInformation,
): {
    subject: string;
    template: string;
} => {
    switch (notificationType) {
        case NotificationType.NEW_MESSAGE:
            return {
                subject: NEW_MSG_EMAIL_SUBJECT,
                template: NEW_MSG_EMAIL_TEMPLATE(deliveryInformation),
            };
        case NotificationType.OTP:
            return {
                subject: OTP_EMAIL_SUBJECT,
                template: OTP_EMAIL_TEMPLATE(generateOtp()),
            };
        default:
            throw new Error(
                `Notification type ${notificationType} is not supported`,
            );
    }
};
