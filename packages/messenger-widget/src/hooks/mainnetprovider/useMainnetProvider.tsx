import React from 'react';
import { MainnetProviderContext } from '../../context/ProviderContext';

export const useMainnetProvider = () => {
    const { provider } = React.useContext(MainnetProviderContext);
    return provider;
};
