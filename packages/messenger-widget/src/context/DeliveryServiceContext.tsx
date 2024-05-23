import React from 'react';
import { useDeliveryService } from '../hooks/server-side/useDeliveryService';

export type DeliveryServiceContextType = {};

export const DeliveryServiceContext =
    React.createContext<DeliveryServiceContextType>({});

export const DeliveryServiceContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const ds = useDeliveryService();

    return (
        <DeliveryServiceContext.Provider value={{}}>
            {children}
        </DeliveryServiceContext.Provider>
    );
};
