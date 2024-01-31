/* eslint-disable no-console */
import { sha256 } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { keccak256 } from 'viem';

export const getCachedProvider = (
    provider: ethers.providers.JsonRpcProvider,
) => {
    const cache = new Map<string, any>();

    const unique = new Set();
    const cacheHandler: ProxyHandler<ethers.providers.JsonRpcProvider> = {
        get: (target, fnSig, receiver) => {
            if (fnSig === 'send') {
                return async (method: string, ...args: any[]) => {
                    //Simpy caching chainId safes 10 sek of initial load time
                    if (method === 'eth_chainId') {
                        console.log(method);
                        const key = `${fnSig}-${method}`;
                        if (cache.has(key)) {
                            console.log('cache hit ', key);
                            return cache.get(key);
                        }

                        console.log(
                            'chain id cache miss ',
                            sha256(method + fnSig),
                        );
                        //@ts-ignore
                        const result = await target[fnSig](method);
                        cache.set(key, result);
                        return result;
                    }

                    if (method === 'eth_call') {
                        const [[{ data, to }]] = args;
                        const key = `${fnSig}-${method}-${sha256(to)}-${sha256(
                            data,
                        )}`;
                        if (cache.has(key)) {
                            console.log('eth_call cache hit ');
                            return cache.get(key);
                        }

                        console.log(
                            'ethcall  cache miss ',
                            sha256(method + fnSig),
                        );

                        //@ts-ignore
                        const result = await target[fnSig](method, ...args);
                        cache.set(key, result);
                        return result;
                    }

                    console.log('send  cache miss ', sha256(method + fnSig));

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
