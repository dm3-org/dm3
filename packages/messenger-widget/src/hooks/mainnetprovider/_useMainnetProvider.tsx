/* eslint-disable no-console */
import { ethers } from 'ethers';
import { getCachedProvider } from './cache/providerCache';

export const _useMainnetProvider = (): ethers.providers.JsonRpcProvider => {
    const url = process.env.REACT_APP_MAINNET_PROVIDER_RPC;
    if (!url) {
        throw new Error('Mainnet provider not set in env');
    }

    const provider = new ethers.providers.JsonRpcProvider(url, {
        name: 'goerli',
        chainId: 5,
    });

    return getCachedProvider(provider);
};
