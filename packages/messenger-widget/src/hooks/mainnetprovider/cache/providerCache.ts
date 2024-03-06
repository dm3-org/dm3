import { ethers } from 'ethers';

export const getCachedProvider = (
    provider: ethers.providers.JsonRpcProvider,
) => {
    const cache = new Map<string, any>();
    const cacheHandler: ProxyHandler<ethers.providers.JsonRpcProvider> = {
        get: (target, fnSig, receiver) => {
            if (fnSig === 'send') {
                return async (method: string, ...args: any[]) => {
                    //Simpy caching chainId safes 10 sek of initial load time
                    if (method === 'eth_chainId') {
                        const key = `${fnSig}-${method}`;
                        if (cache.has(key)) {
                            return cache.get(key);
                        }

                        //@ts-ignore
                        const result = await target[fnSig](method);
                        cache.set(key, result);
                        return result;
                    }

                    if (method === 'eth_call') {
                        const [[{ data, to }]] = args;
                        const key = `${fnSig}-${method}-${to}-${data}`;
                        if (cache.has(key)) {
                            return cache.get(key);
                        }

                        //@ts-ignore
                        const result = await target[fnSig](method, ...args);
                        cache.set(key, result);
                        return result;
                    }

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
