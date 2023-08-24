import { DeliveryInformation } from 'dm3-lib-messaging';
import { logError } from 'dm3-lib-shared';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type EmailNotificationServerConfig = SMTPTransport.Options & {
    //The address the mail serves uses as sender
    senderAddress: string;
};

export type EmailNotificationUserConfig = {
    //The address the user has specified to receive notifications.
    recipientAddress: string;
};
export const MAIL_SUBJECT = 'New DM3 Message';
export const MAIL_HTML = (
    deliveryInformation: DeliveryInformation,
) => `<html lang="en">
<body>
<p>You have received a new DM3 message from ${deliveryInformation.from}.
<br/>
 Open  <a href = "app.dm3.network">DM3</a> to read it</p>
  <script src="index.js"></script>
</body>
</html>`;

export function Email(config: EmailNotificationServerConfig) {
    const send = async (
        mailConfig: EmailNotificationUserConfig,
        deliveryInformation: DeliveryInformation,
    ) => {
        nodemailer.createTestAccount();
        const transport = nodemailer.createTransport(new SMTPTransport(config));

        try {
            await transport.sendMail({
                from: config.senderAddress,
                to: mailConfig.recipientAddress,
                subject: MAIL_SUBJECT,
                html: MAIL_HTML(deliveryInformation),
            });
            transport.close();
        } catch (err) {
            logError('Send mail failed ' + err);
        }
    };

    return { send };
}
