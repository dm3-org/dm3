import { ethers } from 'ethers';
import { readKeyFromEnv } from './readKeyEnv';

export function getWeb3Provider(): ethers.providers.BaseProvider {
    const rpc = readKeyFromEnv('RPC');
    return new ethers.providers.JsonRpcProvider(rpc);
}
