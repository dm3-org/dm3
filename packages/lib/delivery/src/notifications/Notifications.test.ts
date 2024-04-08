import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import {
    NotificationType,
} from './types';
import {
    NotificationBroker,
    _setupNotficationBroker,
} from './broker/NotificationBroker';
import { NotificationChannel, NotificationChannelType } from '@dm3-org/dm3-lib-shared';

jest.mock('nodemailer');

describe('Notifications', () => {
    it('Send Email notification to verify OTP', async () => {
        const dsNotificationChannels: NotificationChannel[] = [
            {
                type: NotificationChannelType.EMAIL,
                config: {
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    smtpEmail: 'abc@gmail.com',
                    smtpUsername: 'abc@gmail.com',
                    smtpPassword: 'abcd1234',
                },
            },
        ];

        const channel1 = {
            type: NotificationChannelType.EMAIL,
            config: {
                recipientValue: 'bob@gmail.com',
                isEnabled: true,
                isVerified: false,
            },
        };

        const otpContent = {
            otp: '12345',
            dm3ContactEmailID: 'test@gmail.com',
        };

        const getUsersNotificationChannels = (user: string) => {
            return Promise.resolve([channel1]);
        };

        /**
         * using the require statement inside it statement otherwise
         * one of the it statement was getting failed because both of them
         * uses mocking of nodemailer. I don't know what is the reason of it.
         * But putting separate require statement & mocking inside separate test works
         */
        const nodemailer = require('nodemailer');
        const sendOtpMailMock = jest.fn();

        nodemailer.createTransport.mockReturnValue({
            sendMail: sendOtpMailMock,
            close: () => {},
        });

        const { sendOtp } = NotificationBroker(
            dsNotificationChannels,
            NotificationType.OTP,
        );

        await sendOtp('bob.eth', getUsersNotificationChannels, otpContent);

        expect(sendOtpMailMock).toHaveBeenCalled();
    });

    it('Should not send email when notification channel is not verified', async () => {
        const dsNotificationChannels: NotificationChannel[] = [
            {
                type: NotificationChannelType.EMAIL,
                config: {
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    smtpEmail: 'abc@gmail.com',
                    smtpUsername: 'abc@gmail.com',
                    smtpPassword: 'abcd1234',
                },
            },
        ];

        const channel1 = {
            type: NotificationChannelType.EMAIL,
            config: {
                recipientValue: 'bob@gmail.com',
                isEnabled: true,
                isVerified: false,
            },
        };

        const deliveryInformation: DeliveryInformation = {
            from: 'bob.eth',
            to: 'yuno.eth',
        };

        const getUsersNotificationChannels = (user: string) => {
            return Promise.resolve([channel1]);
        };

        /**
         * using the require statement inside it statement otherwise
         * one of the it statement was getting failed because both of them
         * uses mocking of nodemailer. I don't know what is the reason of it.
         * But putting separate require statement & mocking inside separate test works
         */
        const nodemailer = require('nodemailer');
        const sendNewMsgMailMock = jest.fn();

        nodemailer.createTransport.mockReturnValue({
            sendMail: sendNewMsgMailMock,
            close: () => {},
        });

        const { sendNotification } = NotificationBroker(
            dsNotificationChannels,
            NotificationType.NEW_MESSAGE,
        );

        await sendNotification(
            deliveryInformation,
            getUsersNotificationChannels,
        );

        expect(sendNewMsgMailMock).not.toHaveBeenCalled();
    });
});
