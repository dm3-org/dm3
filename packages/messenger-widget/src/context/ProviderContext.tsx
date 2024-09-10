import React from 'react';
import { _useMainnetProvider } from '../hooks/mainnetprovider/_useMainnetProvider';
import { ethers } from 'ethers';
import { DM3Configuration } from '../interfaces/config';

export type MainnetProviderContextType = {
    provider: ethers.providers.JsonRpcProvider;
};

export const MainnetProviderContext =
    React.createContext<MainnetProviderContextType>({
        provider: {} as ethers.providers.JsonRpcProvider,
    });

export const MainnetProviderContextProvider = ({
    children,
    dm3Configuration,
}: {
    children?: any;
    dm3Configuration: DM3Configuration;
}) => {
    const mainnetProvider = _useMainnetProvider(dm3Configuration);
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
