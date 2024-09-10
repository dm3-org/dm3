import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';

export const NEW_MSG_EMAIL_TEMPLATE = (
    deliveryInformation: DeliveryInformation,
) =>
    `<html lang="en">
    <body>
        <p>You received a new message from ${deliveryInformation.from}.
    </body>
</html>`;

export const NEW_MSG_EMAIL_SUBJECT = 'DM3 New Message';
