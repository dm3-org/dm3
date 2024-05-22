import {
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';
import {
    RESEND_VERIFICATION_OTP_TIME_PERIOD,
    addNewNotificationChannel,
    toggleNotificationChannel,
    sendOtp,
    verifyOtp,
    removeNotificationChannel,
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
                await sendOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    'test' as NotificationChannelType,
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'Notification channel test is currently not supported by the DS',
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
                await sendOtp(
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
                await sendOtp(
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
                await sendOtp(
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
                await sendOtp(
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

            await sendOtp(
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

    describe('Verify Email OTP', () => {
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

        it('Should throw error as notification channel is not supported by DS', async () => {
            const getUsersNotificationChannels = () => {};

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            try {
                await verifyOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    '98567',
                    [],
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'Notification channel EMAIL is currently not supported by the DS',
                );
            }
        });

        it('Should throw error as EMAIL notification channel is not configured', async () => {
            const getUsersNotificationChannels = () => Promise.resolve([]);

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            try {
                await verifyOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    '98567',
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'EMAIL notification channel is not configured',
                );
            }
        });

        it('Should throw error as EMAIL notification channel is not enabled', async () => {
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
                await verifyOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    '98567',
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'EMAIL notification channel is not enabled',
                );
            }
        });

        it('Should throw error as EMAIL notification channel is already verified', async () => {
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
                await verifyOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    '98567',
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'EMAIL notification channel is already verified',
                );
            }
        });

        it('Should throw error as OTP is not found in DB', async () => {
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

            const getOtp = () => Promise.resolve(null);

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            try {
                await verifyOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    '98567',
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'Otp not found, please resend the OTP for verification',
                );
            }
        });

        it('Should throw error as OTP is invalid', async () => {
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

            const getOtp = () =>
                Promise.resolve({
                    otp: '12345',
                    type: NotificationChannelType.EMAIL,
                    generatedAt: new Date(),
                });

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            try {
                await verifyOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    '98567',
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe('Invalid OTP');
            }
        });

        it('Should throw error as OTP is expired', async () => {
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

            // set generated time more than 10 minutes before from now
            const currentTime = new Date();
            const generatedAt = new Date(
                currentTime.setSeconds(currentTime.getSeconds() - 610),
            );

            const getOtp = () =>
                Promise.resolve({
                    otp: '12345',
                    type: NotificationChannelType.EMAIL,
                    generatedAt: generatedAt,
                });

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
            };

            try {
                await verifyOtp(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    '12345',
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe('OTP is expired');
            }
        });

        it('Should verify the EMAIL OTP', async () => {
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

            const getOtp = () =>
                Promise.resolve({
                    otp: '12345',
                    type: NotificationChannelType.EMAIL,
                    generatedAt: new Date(),
                });

            // mock functions
            const setNotificationChannelAsVerified = jest.fn();
            const resetOtp = jest.fn();

            const db = {
                getUsersNotificationChannels,
                getOtp,
                setOtp,
                setNotificationChannelAsVerified,
                resetOtp,
            };

            await verifyOtp(
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                NotificationChannelType.EMAIL,
                '12345',
                notificationChannels,
                db,
            );

            expect(setNotificationChannelAsVerified).toHaveBeenCalled();
            expect(resetOtp).toHaveBeenCalled();
        });
    });

    describe('Disable Email notification channel', () => {
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

        it('Should throw error as Email notification channel is not supported by DS', async () => {
            const getUsersNotificationChannels = () => {};

            const db = {
                getUsersNotificationChannels,
            };

            try {
                await toggleNotificationChannel(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    false,
                    NotificationChannelType.EMAIL,
                    [],
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'Notification channel EMAIL is currently not supported by the DS',
                );
            }
        });

        it('Should throw error as Email notification channel is not configured', async () => {
            const getUsersNotificationChannels = () => Promise.resolve([]);

            const db = {
                getUsersNotificationChannels,
            };

            try {
                await toggleNotificationChannel(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    false,
                    NotificationChannelType.EMAIL,
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'EMAIL notification channel is not configured',
                );
            }
        });

        it('Should disable Email notification channel', async () => {
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

            const toggleNotificationChannel = jest.fn();

            const db = {
                getUsersNotificationChannels,
                toggleNotificationChannel,
            };

            await toggleNotificationChannel(
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                false,
                NotificationChannelType.EMAIL,
                notificationChannels,
                db,
            );

            expect(toggleNotificationChannel).toHaveBeenCalled();
        });
    });

    describe('Enable Email notification channel', () => {
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

        it('Should throw error as Email notification channel is not supported by DS', async () => {
            const getUsersNotificationChannels = () => {};

            const db = {
                getUsersNotificationChannels,
            };

            try {
                await toggleNotificationChannel(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    true,
                    NotificationChannelType.EMAIL,
                    [],
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'Notification channel EMAIL is currently not supported by the DS',
                );
            }
        });

        it('Should throw error as Email notification channel is not configured', async () => {
            const getUsersNotificationChannels = () => Promise.resolve([]);

            const db = {
                getUsersNotificationChannels,
            };

            try {
                await toggleNotificationChannel(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    true,
                    NotificationChannelType.EMAIL,
                    notificationChannels,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'EMAIL notification channel is not configured',
                );
            }
        });

        it('Should enable Email notification channel', async () => {
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

            const toggleNotificationChannel = jest.fn();

            const db = {
                getUsersNotificationChannels,
                toggleNotificationChannel,
            };

            await toggleNotificationChannel(
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                true,
                NotificationChannelType.EMAIL,
                notificationChannels,
                db,
            );

            expect(toggleNotificationChannel).toHaveBeenCalled();
        });
    });

    describe('Removes Email notification channel', () => {
        it('Should throw error as Email notification channel is not configured', async () => {
            const getUsersNotificationChannels = () => Promise.resolve([]);

            const db = {
                getUsersNotificationChannels,
            };

            try {
                await removeNotificationChannel(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.EMAIL,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'EMAIL notification channel is not configured',
                );
            }
        });

        it('Should remove Email notification channel', async () => {
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

            const removeNotificationChannelMock = jest.fn();

            const db = {
                getUsersNotificationChannels,
                removeNotificationChannel: removeNotificationChannelMock,
            };

            await removeNotificationChannel(
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                NotificationChannelType.EMAIL,
                db,
            );

            expect(removeNotificationChannelMock).toHaveBeenCalled();
        });
    });

    describe('Adds Push Notification Channel', () => {
        it('adds push notification channel', async () => {
            const recipientValue = {
                endpoint: 'https://test.com',
                keys: {
                    auth: 'authkey',
                    p256dh: 'p256dh',
                },
            };

            const setNotificationChannelAsVerified = jest.fn();
            const addUsersNotificationChannel = jest.fn();
            const getUsersNotificationChannels = () => Promise.resolve([]);

            const notificationChannels: NotificationChannel[] = [
                {
                    type: NotificationChannelType.PUSH,
                    config: {
                        vapidEmailId: 'test@gmail.com',
                        publicVapidKey: 'dbiwqeqwewqosa',
                        privateVapidKey: 'wqieyiwqeqwnsd',
                    },
                },
            ];

            const db = {
                getUsersNotificationChannels,
                addUsersNotificationChannel,
                setNotificationChannelAsVerified,
            };

            await addNewNotificationChannel(
                NotificationChannelType.PUSH,
                recipientValue as any,
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                notificationChannels,
                db,
            );

            expect(addUsersNotificationChannel).toBeCalled();
        });
    });

    describe('Removes Push notification channel', () => {
        it('Should throw error as Push notification channel is not configured', async () => {
            const getUsersNotificationChannels = () => Promise.resolve([]);

            const db = {
                getUsersNotificationChannels,
            };

            try {
                await removeNotificationChannel(
                    '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                    NotificationChannelType.PUSH,
                    db,
                );
            } catch (error: any) {
                expect(error.message).toBe(
                    'PUSH notification channel is not configured',
                );
            }
        });

        it('Should remove Push notification channel', async () => {
            const recipientValue = {
                endpoint: 'https://test.com',
                keys: {
                    auth: 'authkey',
                    p256dh: 'p256dh',
                },
            };

            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.PUSH,
                        config: {
                            recipientValue: recipientValue,
                            isVerified: false,
                            isEnabled: true,
                        },
                    },
                ]);

            const removeNotificationChannelMock = jest.fn();

            const db = {
                getUsersNotificationChannels,
                removeNotificationChannel: removeNotificationChannelMock,
            };

            await removeNotificationChannel(
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                NotificationChannelType.PUSH,
                db,
            );

            expect(removeNotificationChannelMock).toHaveBeenCalled();
        });
    });
});
