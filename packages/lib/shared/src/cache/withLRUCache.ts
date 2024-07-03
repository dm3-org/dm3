import { ethers } from 'ethers';
import { LRUCache } from './impl/LRUCache';

const DEFAULT_CACHE_SIZE = 500;

export const withLRUCache = (
    provider: ethers.providers.JsonRpcProvider,
    size = DEFAULT_CACHE_SIZE,
) => {
    const cache = new LRUCache<unknown>(size);
};
