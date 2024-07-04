import { ethers } from 'ethers';
import { ICache } from './impl/ICache';
import { LRUCache } from './impl/LRUCache';
import { TTLCache, TTLCacheItem } from './impl/TTLCache';
import { IPersistance } from './persistance/IPersistance';
import { InMemory } from './persistance/InMemory';
import { sha256 } from '../sha256';
import { LocalStorage } from './persistance/LocalStorage';

const DEFAULT_CAPACITY = 500;
//1 hour
const DEFAULT_TTL = 3600000;

//Factory to create different types of caches for the web3 provider
export class Web3ProviderCacheFactory {
    private readonly provider: ethers.providers.JsonRpcProvider;

    constructor(provider: ethers.providers.JsonRpcProvider) {
        this.provider = provider;
    }
    //TTL cache with local storage as persistance
    public TTLLocalStorage<T>(ttl: number = DEFAULT_TTL) {
        return this.TTL(new LocalStorage<TTLCacheItem<T>>(), ttl);
    }
    //Returns an instance of the web3 provder. Requests are cached for a given time to live
    public TTL<T>(
        persistance: IPersistance<TTLCacheItem<T>> = new InMemory(),
        ttl: number = DEFAULT_TTL,
    ): ethers.providers.JsonRpcProvider {
        const cache = new TTLCache<T>(DEFAULT_CAPACITY, ttl, persistance);
        const instance = Web3ProviderCacheFactory._createInstance(
            this.provider,
            cache,
        );
        return instance;
    }
    //Returns an instance of the web3 provider. Requests are cached using LRU strategy
    public LRU<T>(
        persistance: IPersistance<T> = new InMemory(),
        capacity: number = DEFAULT_CAPACITY,
    ): ethers.providers.JsonRpcProvider {
        const cache = new LRUCache<T>(capacity, persistance);
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
