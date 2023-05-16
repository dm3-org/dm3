import { ethers } from 'ethers';
import React, { PropsWithChildren } from 'react';
import { AuthProps, useAuth } from '../hooks/useAuth';
import { ProfileKeys } from 'dm3-lib-profile';

export type AuthContextType = {
    getProfileKeys: () => Promise<ProfileKeys>;
};

export const AuthContext = React.createContext<AuthContextType>({
    getProfileKeys: () => Promise.reject('unimplemented'),
});

interface Props {
    web3Provider: ethers.providers.JsonRpcProvider;
    clientProps: AuthProps;
}

export const AuthContextProvider = ({
    web3Provider,
    clientProps,
    children,
}: PropsWithChildren<Props>) => {
    const { getProfileKeys } = useAuth(web3Provider, clientProps);
    return (
        <AuthContext.Provider value={{ getProfileKeys }}>
            {children}
        </AuthContext.Provider>
    );
};
