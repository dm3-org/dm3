/* eslint-disable no-console */
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { StorageLocation, UserDB } from '@dm3-org/dm3-lib-storage';
import React from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { ConnectionType, UserDbType } from '../utils/enum-type-utils';

export type AuthContextType = {
    cleanSignIn: () => Promise<void>;
    account: Account | undefined;
    displayName: string | undefined;
    deliveryServiceToken: string | undefined;
    isLoggedIn: boolean;
    isLoading: boolean;
    hasError: boolean;
    ethAddress: string | undefined;
    setAccount: Function;
    profileKeys: ProfileKeys | undefined;
};

export const AuthContext = React.createContext<AuthContextType>({
    cleanSignIn: () => Promise.resolve(),
    account: undefined,
    displayName: undefined,
    deliveryServiceToken: undefined,
    isLoggedIn: false,
    isLoading: false,
    hasError: false,
    ethAddress: undefined,
    setAccount: Function,
    profileKeys: undefined,
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
        displayName,
        deliveryServiceToken,
        isLoggedIn,
        isLoading,
        hasError,
        ethAddress,
        setAccount,
        profileKeys,
    } = useAuth(onStorageCreated);
    return (
        <AuthContext.Provider
            value={{
                cleanSignIn,
                account,
                displayName,
                deliveryServiceToken,
                isLoggedIn,
                isLoading,
                hasError,
                ethAddress,
                setAccount,
                profileKeys,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
