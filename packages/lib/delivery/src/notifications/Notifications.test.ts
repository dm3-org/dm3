import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import { NotificationChannelType, NotificationType } from './types';
import {
    NotificationBroker,
    _setupNotficationBroker,
} from './broker/NotificationBroker';
import { getDeliveryServiceProperties } from '../../../../backend/src/config/getDeliveryServiceProperties';

jest.mock('nodemailer');
const sendMailMock = jest.fn();

const nodemailer = require('nodemailer'); //doesn't work with import. idk why
nodemailer.createTransport.mockReturnValue({
    sendMail: sendMailMock,
    close: () => {},
});

describe('Notifications', () => {
    it('send notifications to channel', async () => {
        const deliveryInformation: DeliveryInformation = {
            to: 'alice.eth',
            from: 'bob.eth',
        };

        const dsNotificationChannels =
            getDeliveryServiceProperties().notificationChannel;

        const channel1 = {
            type: NotificationChannelType.EMAIL,
            config: {
                recipientValue: 'bob@gmail.com',
                isEnabled: true,
                isVerified: false,
            },
        };

        const getUsersNotificationChannels = (user: string) => {
            return Promise.resolve([channel1]);
        };

        const { sendNotification } = NotificationBroker(
            dsNotificationChannels,
            NotificationType.OTP,
        );

        await sendNotification(
            deliveryInformation,
            getUsersNotificationChannels,
        );

        expect(sendMailMock).toHaveBeenCalled();
    });
});
