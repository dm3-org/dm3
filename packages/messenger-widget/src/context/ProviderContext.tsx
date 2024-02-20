/* eslint-disable no-console */
import React from 'react';
import { _useMainnetProvider } from '../hooks/mainnetprovider/_useMainnetProvider';
import { ethers } from 'ethers';

export type MainnetProviderContextType = {
    provider: ethers.providers.JsonRpcProvider;
};

export const MainnetProviderContext =
    React.createContext<MainnetProviderContextType>({
        provider: {} as ethers.providers.JsonRpcProvider,
    });

export const MainnetProviderContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const mainnetProvider = _useMainnetProvider();
    return (
        <MainnetProviderContext.Provider
            value={{
                provider: mainnetProvider,
            }}
        >
            {children}
        </MainnetProviderContext.Provider>
    );
};
