import { ethers } from 'ethers';
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ClientProps } from '../hooks/useBillboard';
import { ProfileKeys } from 'dm3-lib-profile';

export type AuthContextType = {
    getProfileKeys: () => Promise<ProfileKeys>;
};

export const AuthContext = React.createContext<AuthContextType>({
    getProfileKeys: () => Promise.reject('unimplemented'),
});

export const AuthContextProvider = ({
    web3Provider,
    clientProps,
    children,
}: {
    web3Provider: ethers.providers.JsonRpcProvider;
    clientProps: ClientProps;
    children?: any;
}) => {
    const { getProfileKeys } = useAuth(web3Provider, clientProps);
    return (
        <AuthContext.Provider value={{ getProfileKeys }}>
            {children}
        </AuthContext.Provider>
    );
};
