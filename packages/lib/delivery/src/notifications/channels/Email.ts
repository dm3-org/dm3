import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import { logError } from '@dm3-org/dm3-lib-shared';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { NotificationType } from '../types';
import { fetchEmailSubjectAndTemplate } from '../getEmailTemplate';

// email server configuration
export type EmailNotificationServerConfig = {
    host: string;
    port: number;
    username: string;
    password: string;
    emailID: string;
};

// email notification configuration
export type EmailNotificationUserConfig = {
    recipientAddress: string;
};

type UserEmailConfig = {
    recipientAddress: string;
    notificationType: NotificationType;
};

// method to send email
export function Email(config: EmailNotificationServerConfig) {
    const send = async (
        mailConfig: UserEmailConfig,
        deliveryInformation: DeliveryInformation,
    ) => {
        try {
            // create transport with email credentials
            const transport: nodemailer.Transporter<SMTPTransport.SentMessageInfo> =
                nodemailer.createTransport({
                    host: config.host,
                    port: config.port,
                    auth: {
                        user: config.username,
                        pass: config.password,
                    },
                });

            // fetch the specific subject & template of email
            const { subject, template } = fetchEmailSubjectAndTemplate(
                mailConfig.notificationType,
                deliveryInformation,
            );

            // send the email using nodemailer
            await transport.sendMail({
                from: config.emailID,
                to: mailConfig.recipientAddress,
                subject: subject,
                html: template,
            });

            // close the connection
            transport.close();
        } catch (err) {
            logError('Send mail failed ' + err);
        }
    };

    return { send };
}
