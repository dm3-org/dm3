import { NotificationChannel, NotificationChannelType } from './notifications';
import { addNewNotificationChannel } from './Notification';
import { getDeliveryServiceProperties } from '../../../backend/src/config/getDeliveryServiceProperties';
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

            const notificationChannels: NotificationChannel[] =
                getDeliveryServiceProperties().notificationChannel;

            await addNewNotificationChannel(
                NotificationChannelType.EMAIL,
                'bob@gmail.com',
                '0x71cb05ee1b1f506ff321da3dac38f25c0c9ce6e1',
                notificationChannels,
                getUsersNotificationChannels,
                addUsersNotificationChannel,
                setOtp,
            );

            expect(addUsersNotificationChannel).toBeCalled();
            expect(setOtp).toBeCalled();
            expect(sendMailMock).toHaveBeenCalled();
        });
    });
});
