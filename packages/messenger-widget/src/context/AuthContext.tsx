/* eslint-disable no-console */
import React, { useContext } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { StorageLocation, UserDB } from 'dm3-lib-storage';
import { ConnectionType, UserDbType } from '../utils/enum-type-utils';
import { Account, UserProfile } from 'dm3-lib-profile';

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
        console.log('onStorageCreated ', db);
        dispatch({
            type: ConnectionType.ChangeStorageLocation,
            payload: StorageLocation.dm3Storage,
        });
        dispatch({ type: UserDbType.setDB, payload: db! });
    };

    // eslint-disable-next-line no-console
    console.log('AuthContextProvider');

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
