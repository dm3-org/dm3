/* eslint-disable no-console */
import { ethers } from 'ethers';
import { Express, NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';
import winston from 'winston';
import { ExtendedError } from 'socket.io/dist/namespace';
import { WithLocals } from '../../../backend/src/types';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { checkToken } from '@dm3-org/dm3-lib-delivery';
import { KeyPair } from '@dm3-org/dm3-lib-crypto';

export async function auth(
    req: Request,
    res: Response,
    next: NextFunction,
    ensName: string,
) {
    const normalizedEnsName = normalizeEnsName(ensName);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (
        token &&
        (await checkToken(
            req.app.locals.web3Provider,
            req.app.locals.db.getSession,
            normalizedEnsName,
            token,
        ))
    ) {
        next();
    } else {
        global.logger.warn({
            method: 'AUTH',
            error: 'Token check failed',
            normalizedEnsName,
        });
        res.sendStatus(401);
    }
}

export function socketAuth(app: Express & WithLocals) {
    return async (
        socket: Socket,
        next: (err?: ExtendedError | undefined) => void,
    ) => {
        try {
            const ensName = normalizeEnsName(
                socket.handshake.auth.account.ensName,
            );

            global.logger.info({
                method: 'WS CONNECT',
                ensName,
                socketId: socket.id,
            });

            if (
                !(await checkToken(
                    app.locals.web3Provider,
                    app.locals.db.getSession,
                    ensName,
                    socket.handshake.auth.token as string,
                ))
            ) {
                return next(new Error('invalid username'));
            }
            const session = await app.locals.db.getSession(ensName);
            if (!session) {
                throw Error('Could not get session');
            }

            await app.locals.db.setSession(ensName, {
                ...session,
                socketId: socket.id,
            });
        } catch (e) {
            next(e as Error);
        }

        next();
    };
}

export function logRequest(req: Request, res: Response, next: NextFunction) {
    global.logger.info({
        method: req.method,
        url: req.url,
        timestamp: new Date().getTime(),
    });
    next();
}

export function logError(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    global.logger.error({
        method: req.method,
        url: req.url,
        error: error.toString(),
        timestamp: new Date().getTime(),
    });
    next();
}

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    res.status(500);
    res.render('error', { error: err });
}

export function readKeysFromEnv(env: NodeJS.ProcessEnv): {
    encryption: KeyPair;
    signing: KeyPair;
} {
    const readKey = (keyName: string) => {
        const key = env[keyName];
        if (!key) {
            throw Error(`Missing ${keyName} in env`);
        }

        return key;
    };

    return {
        signing: {
            publicKey: readKey('SIGNING_PUBLIC_KEY'),
            privateKey: readKey('SIGNING_PRIVATE_KEY'),
        },
        encryption: {
            publicKey: readKey('ENCRYPTION_PUBLIC_KEY'),
            privateKey: readKey('ENCRYPTION_PRIVATE_KEY'),
        },
    };
}

export async function getWeb3Provider(
    env: NodeJS.ProcessEnv,
): Promise<ethers.providers.JsonRpcProvider> {
    const readKey = (keyName: string) => {
        const key = env[keyName];
        if (!key) {
            throw Error(`Missing ${keyName} in env`);
        }

        return key;
    };

    const rpc = readKey('RPC');
    //It has turned out, that requests to the provider are not the reason for the backend beeing so slow.
    //Caching request however would be still usefull, however that would require to implement a proper cache invalidation strategy.
    //TODO build proper cache
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    //Autodected the current network
    const nw = await provider.getNetwork();

    return new ethers.providers.JsonRpcProvider(rpc, {
        ...nw,
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    });

    // return getCachedProvider(new ethers.providers.JsonRpcProvider(rpc));
}

const getCachedProvider = (
    provider: ethers.providers.JsonRpcProvider,
    //TTL in seconds
    ttl = 300,
) => {
    type CacheItem = {
        createAt: number;
        value: any;
    };
    const cache = new Map<string, CacheItem>();
    const ttlInMs = ttl * 1000;

    const cacheHandler: ProxyHandler<ethers.providers.JsonRpcProvider> = {
        get: (target, fnSig, receiver) => {
            if (fnSig === 'send') {
                return async (method: string, ...args: any[]) => {
                    if (method === 'eth_chainId') {
                        const key = `${fnSig}-${method}`;
                        if (cache.has(key)) {
                            const cacheItem = cache.get(key)!;
                            if (cacheItem.createAt + ttlInMs > Date.now()) {
                                console.log('eth_chainId cache hit ', key);
                                return cacheItem.value;
                            }
                            // remove expired cache
                            cache.delete(key);
                            //Continue to fetch the value
                        }

                        //@ts-ignore
                        const result = await target[fnSig](method);

                        cache.set(key, { createAt: Date.now(), value: result });

                        return result;
                    }

                    if (method === 'eth_call') {
                        const [[{ data, to }]] = args;
                        const key = `${fnSig}-${method}-${to}-${data}`;
                        if (cache.has(key)) {
                            const cacheItem = cache.get(key);
                            if (cacheItem!.createAt + ttlInMs > Date.now()) {
                                console.log('eth_call cache hit ', key);
                                return cacheItem!.value;
                            }
                            // remove expired cache
                            cache.delete(key);
                            //Continue to fetch the value
                        }
                        //@ts-ignore
                        const result = await target[fnSig](method, ...args);
                        cache.set(key, { createAt: Date.now(), value: result });
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
