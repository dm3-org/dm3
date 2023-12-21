/* eslint-disable no-console */
import { Account } from 'dm3-lib-profile';
import { StorageLocation, UserDB } from 'dm3-lib-storage';
import React from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { ConnectionType, UserDbType } from '../utils/enum-type-utils';

export type AuthContextType = {
    cleanSignIn: () => Promise<void>;
    account: Account | undefined;
    deliveryServiceToken: string | undefined;
    isLoggedIn: boolean;
    isLoading: boolean;
    hasError: boolean;
    ethAddress: string | undefined;
};

export const AuthContext = React.createContext<AuthContextType>({
    cleanSignIn: () => Promise.resolve(),
    account: undefined,
    deliveryServiceToken: undefined,
    isLoggedIn: false,
    isLoading: false,
    hasError: false,
    ethAddress: undefined,
});

export const AuthContextProvider = ({
    children,
    dispatch,
}: {
    children?: any;
    dispatch: Function;
}) => {
    const onStorageCreated = (db: UserDB) => {
        dispatch({
            type: ConnectionType.ChangeStorageLocation,
            payload: StorageLocation.dm3Storage,
        });
        dispatch({ type: UserDbType.setDB, payload: db! });
    };

    const {
        cleanSignIn,
        account,
        deliveryServiceToken,
        isLoggedIn,
        isLoading,
        hasError,
        ethAddress,
    } = useAuth(onStorageCreated);
    return (
        <AuthContext.Provider
            value={{
                cleanSignIn,
                account,
                deliveryServiceToken,
                isLoggedIn,
                isLoading,
                hasError,
                ethAddress,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
