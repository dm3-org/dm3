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

type UserEmailConfig = {
    recipientEmailId: string;
    notificationType: NotificationType;
    notificationContent: any; // object that can contain OTP to send in email and other details also in funture
};

// method to send email
export function Email(config: EmailNotificationServerConfig) {
    const send = async (mailConfig: UserEmailConfig) => {
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
                mailConfig.notificationContent,
            );

            // send the email using nodemailer
            await transport.sendMail({
                from: config.emailID,
                to: mailConfig.recipientEmailId,
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
