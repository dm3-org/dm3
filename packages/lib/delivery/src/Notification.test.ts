import { NotificationChannel, NotificationChannelType } from './notifications';
import { addNewNotificationChannel } from './Notification';
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
});
