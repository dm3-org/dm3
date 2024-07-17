import { Acknowledgment } from '@dm3-org/dm3-lib-delivery';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import { DeliveryServiceContextType } from '../DeliveryServiceContext';

//Provide a mocked deliveryService context
//Override the default values with the provided values
export const getMockedDeliveryServiceContext = (
    override?: Partial<DeliveryServiceContextType>,
) => {
    const defaultValues = {
        isInitialized: false,
        getDeliveryServiceProperties: function (): Promise<any[]> {
            throw new Error('Function not implemented.');
        },
        fetchNewMessages: function (ensName: string, contactAddress: string) {
            throw new Error('Function not implemented.');
        },
        fetchIncommingMessages: function (ensName: string) {
            throw new Error('Function not implemented.');
        },
        syncAcknowledgment: function (
            ensName: string,
            acknowledgments: Acknowledgment[],
            lastSyncTime: number,
        ): void {
            throw new Error('Function not implemented.');
        },
        getGlobalNotification: function (ensName: string) {
            throw new Error('Function not implemented.');
        },
        getAllNotificationChannels: function (ensName: string) {
            throw new Error('Function not implemented.');
        },
        toggleGlobalNotifications: function (
            ensName: string,
            isEnabled: boolean,
        ) {
            throw new Error('Function not implemented.');
        },
        toggleNotificationChannel: function (
            ensName: string,
            isEnabled: boolean,
            notificationChannelType: NotificationChannelType,
        ) {
            throw new Error('Function not implemented.');
        },
        removeNotificationChannel: function (
            ensName: string,
            notificationChannelType: NotificationChannelType,
        ) {
            throw new Error('Function not implemented.');
        },
        onNewMessage: function (_: any): void {
            throw new Error('Function not implemented.');
        },
        removeOnNewMessageListener: function (): void {
            throw new Error('Function not implemented.');
        },
    };
    return { ...defaultValues, ...override };
};
