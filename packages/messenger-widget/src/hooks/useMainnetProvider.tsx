import { ethers } from 'ethers';

export const useMainnetProvider = () => {
    const url = process.env.REACT_APP_MAINNET_PROVIDER_RPC;
    if (!url) {
        throw new Error('Mainnet provider not set in env');
    }
    return new ethers.providers.JsonRpcProvider(url, {
        name: 'goerli',
        chainId: 5,
    });
};
