import { sha256 } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { LRUCache } from '../cache/LRUCache';
import { getWeb3Provider } from './getWeb3Provider';

const DEFAULT_CACHE_SIZE = 500;

export const getCachedWebProvider = async (
    env: NodeJS.ProcessEnv,
): Promise<ethers.providers.JsonRpcProvider> => {
    //Get the ordinary web3Provider
    const webProvider = await getWeb3Provider(env);

    //Cache every RPC call with LRU cache
    return _withLRUCache(webProvider);
};

const _withLRUCache = (
    provider: ethers.providers.JsonRpcProvider,
    size = DEFAULT_CACHE_SIZE,
) => {
    //sse unknown type for the cache since it can store any type
    const cache = new LRUCache<unknown>(size);

    const cacheHandler: ProxyHandler<ethers.providers.JsonRpcProvider> = {
        get: (target, fnSig, receiver) => {
            if (fnSig === 'send') {
                return async (method: string, ...args: any[]) => {
                    if (method === 'eth_chainId') {
                        const key = sha256(`${fnSig}-${method}`);
                        //Check if the key is known in the cache
                        if (cache.has(key)) {
                            //Get the item and return it
                            return cache.get(key)!;
                        }
                        //Continue to fetch the value from the RPC
                        //The compiler does not know that we are using a proxy method here
                        //So we have to supress the compiler error of the unknown fnSig
                        //@ts-ignore
                        const result = await target[fnSig](method);

                        //Store the new item in the cache, replaces the oldest one if the cache is full
                        cache.set(key, result);

                        return result;
                    }
                    if (method === 'eth_call') {
                        const [[{ data, to }]] = args;
                        const key = sha256(`${fnSig}-${method}-${to}-${data}`);

                        //Check if the key is known in the cache
                        if (cache.has(key)) {
                            return cache.get(key);
                        }

                        //Continue to fetch the value
                        //The compiler does not know that we are using a proxy method here
                        //So we have to supress the compiler error of the unknown fnSig
                        //@ts-ignore
                        const result = await target[fnSig](method, ...args);
                        //Store the new item in the cache, replaces the oldest one if the cache is full
                        cache.set(key, result);
                        return result;
                    }
                    //The compiler does not know that we are using a proxy method here
                    //So we have to supress the compiler error of the unknown fnSig
                    //@ts-ignore
                    return target[fnSig](method, ...args);
                };
            }
            //@ts-ignore
            return target[fnSig];
        },
    };
    return new Proxy(provider, cacheHandler);
};
