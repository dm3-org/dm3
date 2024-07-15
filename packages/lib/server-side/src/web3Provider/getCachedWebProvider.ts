import { ethers } from 'ethers';
import { getWeb3Provider } from './getWeb3Provider';
import { Web3ProviderCacheFactory } from '@dm3-org/dm3-lib-shared';

export const getCachedWebProvider = async (
    env: NodeJS.ProcessEnv,
): Promise<ethers.providers.JsonRpcProvider> => {
    //Get the ordinary web3Provider
    const web3Provider = await getWeb3Provider(env);

    //Cache every RPC call with LRU cache
    return new Web3ProviderCacheFactory(web3Provider).LRU();
};
