import { DeliveryInformation } from 'dm3-lib-messaging';
import { NotificationChannelType } from './types';
import { _setupNotficationBroker } from './broker/NotificationBroker';

describe('Notifications', () => {
    it('send notifications to channel', async () => {
        const mailMock = jest.fn();

        const deliveryInformation: DeliveryInformation = {
            to: 'alice.eth',
            from: 'bob.eth',
        };

        const channel1 = {
            type: NotificationChannelType.EMAIL,
            config: {},
        };

        const channel2 = {
            type: NotificationChannelType.EMAIL,
            config: {},
        };

        const getUsersNotificationChannels = (user: string) => {
            return Promise.resolve([channel1, channel2]);
        };

        const { sendNotification } = _setupNotficationBroker([
            { type: NotificationChannelType.EMAIL, send: mailMock },
        ]);

        await sendNotification(
            deliveryInformation,
            getUsersNotificationChannels,
        );

        expect(mailMock).toHaveBeenCalledTimes(2);
    });
});
