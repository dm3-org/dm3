import { logError } from '@dm3-org/dm3-lib-shared';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { NotificationType } from '../types';
import { fetchEmailSubjectAndTemplate } from '../getEmailTemplate';

// email server configuration
export type EmailNotificationServerConfig = {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    smtpEmail: string;
};

type UserEmailConfig = {
    recipientValue: string;
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
                    host: config.smtpHost,
                    port: config.smtpPort,
                    auth: {
                        user: config.smtpUsername,
                        pass: config.smtpPassword,
                    },
                });

            // fetch the specific subject & template of email
            const { subject, template } = fetchEmailSubjectAndTemplate(
                mailConfig.notificationType,
                mailConfig.notificationContent,
            );

            // send the email using nodemailer
            await transport.sendMail({
                from: config.smtpEmail,
                to: mailConfig.recipientValue,
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
