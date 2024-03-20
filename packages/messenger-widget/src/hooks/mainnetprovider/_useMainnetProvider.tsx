/* eslint-disable no-console */
import { ethers } from 'ethers';
import { getCachedProvider } from './cache/providerCache';
import { DM3Configuration } from '../../interfaces/config';

export const _useMainnetProvider = (
    dm3Configuration: DM3Configuration,
): ethers.providers.JsonRpcProvider => {
    const url = dm3Configuration.ethereumProvider;
    const chainID = dm3Configuration.chainId;

    if (chainID !== '1' && chainID !== '5') {
        throw new Error(
            'Chain ID is not set to please use either goerli or mainnet',
        );
    }
    if (!url) {
        throw new Error('Mainnet provider not set in env');
    }

    const goerliProvider = new ethers.providers.JsonRpcProvider(url, {
        name: 'goerli',
        chainId: 5,
    });

    const mainnetProvider = new ethers.providers.JsonRpcProvider(url, {
        name: 'mainnet',
        chainId: 1,
    });
    // Mainnet provider provides access to a mainnet provider. On testnet that would be goerli
    const provider = chainID === '1' ? mainnetProvider : goerliProvider;

    return getCachedProvider(provider);
};
