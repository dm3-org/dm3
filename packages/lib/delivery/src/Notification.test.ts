import { NotificationChannel, NotificationChannelType } from './notifications';
import {
    RESEND_VERIFICATION_OTP_TIME_PERIOD,
    addNewNotificationChannel,
    resendOtp,
} from './Notification';

jest.mock('nodemailer');

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

            const nodemailer = require('nodemailer');
            const sendMailMock = jest.fn();
            nodemailer.createTransport.mockReturnValue({
                sendMail: sendMailMock,
                close: () => {},
            });

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

        const getOtp = jest.fn();
        const setOtp = jest.fn();

        it('Should throw error as notification channel is not supported', async () => {
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

        it('Should throw error as notification channel is not configured', async () => {
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
                    'EMAIL notification channel not configured',
                );
            }
        });

        it('Should throw error as notification channel is not enabled', async () => {
            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientValue: 'bob@gmail.com',
                            isVerified: false,
                            isEnabled: false,
                        },
                    },
                ]);

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
                    'EMAIL notification channel is not enabled',
                );
            }
        });

        it('Should throw error as notification channel is already verified', async () => {
            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientValue: 'bob@gmail.com',
                            isVerified: true,
                            isEnabled: true,
                        },
                    },
                ]);

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
                    'EMAIL notification channel is already verified',
                );
            }
        });

        it('Should throw error as new OTP can not be sent before RESEND_VERIFICATION_OTP_TIME_PERIOD', async () => {
            const getOtp = async (
                ensName: string,
                channelType: NotificationChannelType,
            ) => {
                return Promise.resolve({
                    otp: '19283',
                    type: NotificationChannelType.EMAIL,
                    generatedAt: new Date(),
                });
            };

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
                    'New OTP can be generated after 1 minutes of last OTP generated',
                );
            }
        });

        it('Should resend new OTP email error for notification channel', async () => {
            const nodemailer = require('nodemailer');
            const sendMailMock = jest.fn();
            nodemailer.createTransport.mockReturnValue({
                sendMail: sendMailMock,
                close: () => {},
            });

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

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            await resendOtp(
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                NotificationChannelType.EMAIL,
                notificationChannels,
                db,
            );

            expect(sendMailMock).toHaveBeenCalled();
        });

        it('Resend OTP time period should be 60 seconds', async () => {
            expect(RESEND_VERIFICATION_OTP_TIME_PERIOD).toBe(60);
        });
    });
});
