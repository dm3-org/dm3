import React from 'react';
import { useDeliveryService } from '../hooks/server-side/useDeliveryService';
import {
    Acknoledgment,
    DeliveryServiceProperties,
} from '@dm3-org/dm3-lib-delivery';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

export type DeliveryServiceContextType = {
    getDeliveryServiceProperties: () => Promise<DeliveryServiceProperties>[];
    getDeliveryServiceTokens: () => string[];
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
    fetchPendingConversations?: (ensName: string) => any;
    fetchNewMessages?: (ensName: string, contactAddress: string) => any;
    syncAcknowledgment?: (
        ensName: string,
        acknoledgments: Acknoledgment[],
        lastSyncTime: number,
    ) => void;
    getGlobalNotification?: (ensName: string) => any;
    getAllNotificationChannels?: (ensName: string) => any;
    toggleGlobalNotifications?: (ensName: string, isEnabled: boolean) => any;
    toggleNotificationChannel?: (
        ensName: string,
        isEnabled: boolean,
        notificationChannelType: NotificationChannelType,
    ) => any;
    removeNotificationChannel?: (
        ensName: string,
        notificationChannelType: NotificationChannelType,
    ) => any;
    onNewMessage: (_: any) => void;
    removeOnNewMessageListener: () => void;
};

export const DeliveryServiceContext =
    React.createContext<DeliveryServiceContextType>({
        getDeliveryServiceProperties: () => [],
        getDeliveryServiceTokens: () => [],
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
        fetchPendingConversations: (ensName: string) => {},
        fetchNewMessages: (ensName: string, contactAddress: string) => {},
        syncAcknowledgment: (
            ensName: string,
            acknoledgments: Acknoledgment[],
            lastSyncTime: number,
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
        getDeliveryServiceTokens,
        addNotificationChannel,
        sendOtp,
        verifyOtp,
        fetchPendingConversations,
        fetchNewMessages,
        syncAcknowledgment,
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
                getDeliveryServiceTokens,
                addNotificationChannel,
                sendOtp,
                verifyOtp,
                fetchPendingConversations,
                fetchNewMessages,
                syncAcknowledgment,
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
