import { NotificationChannel, NotificationChannelType } from './notifications';
import { addNewNotificationChannel, resendOtp } from './Notification';
import { ChannelNotSupportedError } from './errors/ChannelNotSupportedError';
const nodemailer = require('nodemailer');

jest.mock('nodemailer');

const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({
    sendMail: sendMailMock,
    close: () => {},
});

describe('Notification', () => {
    describe('AddEmailNotificationChannel', () => {
        it('adds email notification channel', async () => {
            const addUsersNotificationChannel = jest.fn();
            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientValue: 'bob@gmail.com',
                            isVerified: false,
                            isEnabled: true,
                        },
                    },
                ]);
            const setOtp = jest.fn();

            const notificationChannels: NotificationChannel[] = [
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

            const db = {
                getUsersNotificationChannels,
                addUsersNotificationChannel,
                setOtp,
            };

            await addNewNotificationChannel(
                NotificationChannelType.EMAIL,
                'bob@gmail.com',
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                notificationChannels,
                db,
            );

            expect(addUsersNotificationChannel).toBeCalled();
            expect(setOtp).toBeCalled();
            expect(sendMailMock).toHaveBeenCalled();
        });
    });

    describe('Resend Email verification OTP', () => {
        it('Should throw error on resend email verification OTP as notification channel is not supported', async () => {
            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientValue: 'bob@gmail.com',
                            isVerified: false,
                            isEnabled: true,
                        },
                    },
                ]);
            const getOtp = jest.fn();
            const setOtp = jest.fn();

            const notificationChannels: NotificationChannel[] = [
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

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            try {
                await resendOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    'test' as NotificationChannelType,
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'Notification channel not supported',
                );
            }
        });

        it('Should throw error on resend email verification OTP as notification channel is not supported', async () => {
            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientValue: 'bob@gmail.com',
                            isVerified: false,
                            isEnabled: true,
                        },
                    },
                ]);
            const getOtp = jest.fn();
            const setOtp = jest.fn();

            const notificationChannels: NotificationChannel[] = [
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

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            try {
                await resendOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'Email notification channel not configured',
                );
            }
        });
    });
});
