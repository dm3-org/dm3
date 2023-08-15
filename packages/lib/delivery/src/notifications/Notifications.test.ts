import { DeliveryInformation } from 'dm3-lib-messaging';
import { NotifificationChannelType, setupNotficationBroker } from '.';

describe('Notifications', () => {
    it('send notifications to channel', async () => {
        const mailMock = jest.fn();

        const deliveryInformation: DeliveryInformation = {
            to: 'alice.eth',
            from: 'bob.eth',
        };

        const channel1 = {
            type: NotifificationChannelType.EMAIL,
            data: {},
        };

        const channel2 = {
            type: NotifificationChannelType.EMAIL,
            data: {},
        };

        const getUsersNotificationChannels = (user: string) => {
            return Promise.resolve([channel1, channel2]);
        };

        const { sendNotification } = setupNotficationBroker({
            [NotifificationChannelType.EMAIL]: mailMock,
        });

        await sendNotification(
            deliveryInformation,
            getUsersNotificationChannels,
        );

        expect(mailMock).toHaveBeenCalledTimes(2);
    });
});
