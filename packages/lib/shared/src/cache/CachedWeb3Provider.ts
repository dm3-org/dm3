import { sha256 } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { ICache } from './impl/ICache';
import { LRUCache } from './impl/LRUCache';
import { TTLCache } from './impl/TTLCache';

const DEFAULT_CAPACITY = 500;
//1 hour
const DEFAULT_TTL = 3600000;

export class Web3ProviderCacheFactory {
    private readonly provider: ethers.providers.JsonRpcProvider;

    constructor(provider: ethers.providers.JsonRpcProvider) {
        this.provider = provider;
    }

    public TTL<T>(
        ttl: number = DEFAULT_TTL,
        per: number,
    ): ethers.providers.JsonRpcProvider {
        const cache = new TTLCache<T>(DEFAULT_CAPACITY, ttl);
        const instance = Web3ProviderCacheFactory._createInstance(
            this.provider,
            cache,
        );
        return instance;
    }

    public LRU<T>(
        capacity: number = DEFAULT_CAPACITY,
    ): ethers.providers.JsonRpcProvider {
        const cache = new LRUCache<T>(capacity);
        const instance = Web3ProviderCacheFactory._createInstance(
            this.provider,
            cache,
        );
        return instance;
    }
    private static _createInstance<T>(
        provider: ethers.providers.JsonRpcProvider,
        cache: ICache<T>,
    ) {
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
                            const key = sha256(
                                `${fnSig}-${method}-${to}-${data}`,
                            );

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
        const proxy = new Proxy(provider, cacheHandler);
        return proxy;
    }
}
