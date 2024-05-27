import React from 'react';
import { useDeliveryService } from '../hooks/server-side/useDeliveryService';

export type DeliveryServiceContextType = {
    getDeliveryServiceProperties: () => void;
    isInitialized: boolean;
    onNewMessage: (_: any) => void;
    removeOnNewMessageListener: () => void;
};

export const DeliveryServiceContext =
    React.createContext<DeliveryServiceContextType>({
        isInitialized: false,
        getDeliveryServiceProperties: () => {},
        onNewMessage: () => {},
        removeOnNewMessageListener: () => {},
    });

export const DeliveryServiceContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const {
        getDeliveryServiceProperties,
        isInitialized,
        onNewMessage,
        removeOnNewMessageListener,
    } = useDeliveryService();

    return (
        <DeliveryServiceContext.Provider
            value={{
                getDeliveryServiceProperties,
                isInitialized,
                onNewMessage,
                removeOnNewMessageListener,
            }}
        >
            {children}
        </DeliveryServiceContext.Provider>
    );
};
