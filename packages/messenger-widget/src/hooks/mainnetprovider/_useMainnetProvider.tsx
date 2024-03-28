/* eslint-disable no-console */
import { ethers } from 'ethers';
import { getCachedProvider } from './cache/providerCache';
import { DM3Configuration } from '../../interfaces/config';

export const _useMainnetProvider = (
    dm3Configuration: DM3Configuration,
): ethers.providers.JsonRpcProvider => {
    const url = dm3Configuration.ethereumProvider;
    const chainID = dm3Configuration.chainId;

    if (chainID !== '1' && chainID !== '11155111') {
        throw new Error(
            'Chain ID is not set to please use either sepolia or mainnet',
        );
    }
    if (!url) {
        throw new Error('Mainnet provider not set in env');
    }

    const sepoliaProvider = new ethers.providers.JsonRpcProvider(url, {
        name: 'sepolia',
        chainId: 11155111,
    });

    const mainnetProvider = new ethers.providers.JsonRpcProvider(url, {
        name: 'mainnet',
        chainId: 1,
    });
    // Mainnet provider provides access to a mainnet provider. On testnet that would be sepolia
    const provider = chainID === '1' ? mainnetProvider : sepoliaProvider;

    return getCachedProvider(provider);
};
