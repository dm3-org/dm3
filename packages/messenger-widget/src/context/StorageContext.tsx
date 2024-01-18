/* eslint-disable no-console */
import React, { useContext } from 'react';
import { useStorage } from '../hooks/storage/useStorage';
import { AuthContext } from './AuthContext';

export type StorageContextType = {};

export const StorageContext = React.createContext<StorageContextType>({});

export const StorageContextProvider = ({
    children,
    dispatch,
}: {
    children?: any;
    dispatch: Function;
}) => {
    const { deliveryServiceToken, _initialUserDb } = useContext(AuthContext);

    const s = useStorage(deliveryServiceToken, _initialUserDb);

    return (
        <StorageContext.Provider value={{}}>{children}</StorageContext.Provider>
    );
};
