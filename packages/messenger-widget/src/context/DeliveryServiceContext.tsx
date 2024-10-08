import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import React from 'react';
import { useDeliveryService } from '../hooks/server-side/useDeliveryService';
import { Acknowledgement } from '@dm3-org/dm3-lib-delivery';

export type DeliveryServiceContextType = {
    getDeliveryServiceProperties: () => Promise<any[]>;
    isInitialized: boolean;
    addNotificationChannel?: (
        ensName: string,
        recipientValue: string,
        notificationChannelType: NotificationChannelType,
    ) => any;
    sendOtp?: (
        ensName: string,
        notificationChannelType: NotificationChannelType,
    ) => any;
    verifyOtp?: (
        ensName: string,
        otp: string,
        notificationChannelType: NotificationChannelType,
    ) => any;
    fetchIncomingMessages: (ensName: string) => any;
    syncAcknowledgement: (
        ensName: string,
        acknowledgements: Acknowledgement[],
    ) => void;
    getGlobalNotification: (ensName: string) => any;
    getAllNotificationChannels: (ensName: string) => any;
    toggleGlobalNotifications: (ensName: string, isEnabled: boolean) => any;
    toggleNotificationChannel: (
        ensName: string,
        isEnabled: boolean,
        notificationChannelType: NotificationChannelType,
    ) => any;
    removeNotificationChannel: (
        ensName: string,
        notificationChannelType: NotificationChannelType,
    ) => any;
    onNewMessage: (_: any) => void;
    removeOnNewMessageListener: () => void;
};

export const DeliveryServiceContext =
    React.createContext<DeliveryServiceContextType>({
        getDeliveryServiceProperties: () => Promise.resolve([]),
        isInitialized: false,
        addNotificationChannel: (
            ensName: string,
            recipientValue: string,
            notificationChannelType: NotificationChannelType,
        ) => {},
        sendOtp: (
            ensName: string,
            notificationChannelType: NotificationChannelType,
        ) => {},
        verifyOtp: (
            ensName: string,
            otp: string,
            notificationChannelType: NotificationChannelType,
        ) => {},
        fetchIncomingMessages: (ensName: string) => {},
        syncAcknowledgement: (
            ensName: string,
            acknowledgements: Acknowledgement[],
        ) => {},
        getGlobalNotification: (ensName: string) => {},
        getAllNotificationChannels: (ensName: string) => {},
        toggleGlobalNotifications: (ensName: string, isEnabled: boolean) => {},
        toggleNotificationChannel: (
            ensName: string,
            isEnabled: boolean,
            notificationChannelType: NotificationChannelType,
        ) => {},
        removeNotificationChannel: (
            ensName: string,
            notificationChannelType: NotificationChannelType,
        ) => {},
        onNewMessage: () => {},
        removeOnNewMessageListener: () => {},
    });

export const DeliveryServiceContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const {
        isInitialized,
        getDeliveryServiceProperties,
        addNotificationChannel,
        sendOtp,
        verifyOtp,
        fetchIncomingMessages,
        syncAcknowledgement,
        getGlobalNotification,
        getAllNotificationChannels,
        toggleGlobalNotifications,
        toggleNotificationChannel,
        removeNotificationChannel,
        onNewMessage,
        removeOnNewMessageListener,
    } = useDeliveryService();

    return (
        <DeliveryServiceContext.Provider
            value={{
                isInitialized,
                getDeliveryServiceProperties,
                addNotificationChannel,
                sendOtp,
                verifyOtp,
                fetchIncomingMessages,
                syncAcknowledgement,
                getGlobalNotification,
                getAllNotificationChannels,
                toggleGlobalNotifications,
                toggleNotificationChannel,
                removeNotificationChannel,
                onNewMessage,
                removeOnNewMessageListener,
            }}
        >
            {children}
        </DeliveryServiceContext.Provider>
    );
};
