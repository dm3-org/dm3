import React from 'react';
import { useAccount } from 'wagmi';
import { MainnetProviderContext } from '../../context/ProviderContext';

export const useMainnetProvider = () => {
    useAccount({
        onDisconnect() {
            console.log('dc');
        },
    });

    const { provider } = React.useContext(MainnetProviderContext);
    return provider;
};
