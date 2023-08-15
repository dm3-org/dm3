import { DeliveryInformation } from 'dm3-lib-messaging';
import { logError } from 'dm3-lib-shared';

export const setupNotficationBroker = (supportedChannels: {
    [key in NotifificationChannelType]: SubmitNotification;
}) => {
    async function sendNotification(
        deliveryInformation: DeliveryInformation,
        getNotificationChannels: GetNotificationChannels,
    ) {
        const channels = await getNotificationChannels(deliveryInformation.to);

        channels.forEach((channel) => {
            const send = supportedChannels[channel.type];
            if (!send) {
                logError(`Channel type ${channel.type} is not supported`);
                return;
            }
            send(channel.data);
        });
    }

    return { sendNotification };
};

export enum NotifificationChannelType {
    EMAIL,
}

export interface INotificatationChannel {
    type: NotifificationChannelType;
    data: any;
}
export type SubmitNotification = (data: any) => void;

export type GetNotificationChannels = (
    user: string,
) => Promise<INotificatationChannel[]>;
