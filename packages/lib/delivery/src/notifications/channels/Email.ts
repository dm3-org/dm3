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

export function Email(config: EmailNotificationServerConfig) {
    const send = async (
        mailConfig: EmailNotificationUserConfig,
        deliveryInformation: DeliveryInformation,
    ) => {
        nodemailer.createTestAccount();
        const transport = nodemailer.createTransport(new SMTPTransport(config));

        const html = () => `<html lang="en">
        <body>
        <p>You have received a new DM3 message from ${deliveryInformation.from}.
        <br/>
         Open  <a href = "app.dm3.network">DM3</a> to read it</p>
          <script src="index.js"></script>
        </body>
      </html>`;
        try {
            await transport.sendMail({
                from: config.senderAddress,
                to: mailConfig.recipientAddress,
                subject: 'New DM3 Message',
                html: html(),
            });
        } catch (err) {
            logError('Send mail failed ' + err);
        }
    };

    return { send };
}
