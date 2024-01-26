/* eslint-disable no-console */
import React, { useContext } from 'react';
import { useStorage } from '../hooks/storage/useStorage';
import { AuthContext } from './AuthContext';

export type StorageContextType = {
    storeMessage: Function;
};

export const StorageContext = React.createContext<StorageContextType>({
    storeMessage: Function,
});

export const StorageContextProvider = ({ children }: { children?: any }) => {
    const { account, deliveryServiceToken, profileKeys } =
        useContext(AuthContext);

    const { storeMessage } = useStorage(
        account,
        undefined,
        deliveryServiceToken,
        profileKeys,
    );
    return (
        <StorageContext.Provider value={{ storeMessage }}>
            {children}
        </StorageContext.Provider>
    );
};
