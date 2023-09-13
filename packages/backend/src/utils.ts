import { ethers } from 'ethers';
import { Express, NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { WithLocals } from './types';
import { normalizeEnsName } from 'dm3-lib-profile';
import { checkToken } from 'dm3-lib-delivery';
import { KeyPair } from 'dm3-lib-crypto';

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

            app.locals.logger.info({
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

export function getWeb3Provider(
    env: NodeJS.ProcessEnv,
): ethers.providers.JsonRpcProvider {
    const readKey = (keyName: string) => {
        const key = env[keyName];
        if (!key) {
            throw Error(`Missing ${keyName} in env`);
        }

        return key;
    };

    const rpc = readKey('RPC');
    return new ethers.providers.JsonRpcProvider(rpc);
}
