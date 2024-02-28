import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import React from 'react';
import { useAuth } from '../hooks/auth/useAuth';

export type AuthContextType = {
    cleanSignIn: () => Promise<void>;
    setDisplayName: Function;
    account: Account | undefined;
    displayName: string | undefined;
    deliveryServiceToken: string | undefined;
    isLoggedIn: boolean;
    isLoading: boolean;
    hasError: boolean;
    ethAddress: string | undefined;

    profileKeys: ProfileKeys | undefined;
};

export const AuthContext = React.createContext<AuthContextType>({
    cleanSignIn: () => Promise.resolve(),
    setDisplayName: () => {},
    account: undefined,
    displayName: undefined,
    deliveryServiceToken: undefined,
    isLoggedIn: false,
    isLoading: false,
    hasError: false,
    ethAddress: undefined,

    profileKeys: undefined,
});

export const AuthContextProvider = ({
    children,
    dispatch,
}: {
    children?: any;
    dispatch: Function;
}) => {
    const {
        cleanSignIn,
        setDisplayName,
        account,
        displayName,
        deliveryServiceToken,
        isLoggedIn,
        isLoading,
        hasError,
        ethAddress,

        profileKeys,
    } = useAuth();
    return (
        <AuthContext.Provider
            value={{
                cleanSignIn,
                setDisplayName,
                account,
                displayName,
                deliveryServiceToken,
                isLoggedIn,
                isLoading,
                hasError,
                ethAddress,
                profileKeys,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
