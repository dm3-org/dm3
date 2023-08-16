import { DeliveryInformation } from 'dm3-lib-messaging';
import { logError } from 'dm3-lib-shared';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type EmailNotificationConfig = SMTPTransport.Options & {
    senderAddress: string;
};

export function EmailNotification(config: EmailNotificationConfig) {
    const send = async (
        recipientMail: string,
        deliveryInformation: DeliveryInformation,
    ) => {
        nodemailer.createTestAccount();
        const transport = nodemailer.createTransport(new SMTPTransport(config));

        const html = () => `<html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>HTML 5 Boilerplate</title>
          <link rel="stylesheet" href="style.css">
        </head>
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
                to: recipientMail,
                subject: 'New DM3 Message',
                html: html(),
            });
        } catch (err) {
            logError('Send mail failed ' + err);
        }
    };

    return { send };
}
