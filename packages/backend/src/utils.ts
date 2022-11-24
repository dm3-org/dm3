import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { Express, NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

export async function auth(
    req: Request,
    res: Response,
    next: NextFunction,
    address: string,
) {
    //Address has to be a valid ethereum addresss
    if (!isAddress(address)) {
        return res.sendStatus(400);
    }

    const account = Lib.external.formatAddress(address);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (
        token &&
        (await Lib.delivery.checkToken(
            req.app.locals.db.getSession,
            account,
            token,
        ))
    ) {
        next();
    } else {
        req.app.locals.logger.warn({
            method: 'AUTH',
            error: 'Token check failed',
            account,
        });
        res.sendStatus(401);
    }
}

export function socketAuth(app: Express) {
    return async (
        socket: Socket,
        next: (err?: ExtendedError | undefined) => void,
    ) => {
        const address = socket.handshake.auth.account.address;
        if (!isAddress(address)) {
            return next(new Error('Invalid address'));
        }
        const account = Lib.external.formatAddress(address as string);
        app.locals.logger.info({
            method: 'WS CONNECT',
            account,
            socketId: socket.id,
        });

        if (
            !(await Lib.delivery.checkToken(
                app.locals.db.getSession,
                account,
                socket.handshake.auth.token as string,
            ))
        ) {
            return next(new Error('invalid username'));
        }
        const session = await app.locals.db.getSession(account);
        if (!session) {
            throw Error('Could not get session');
        }

        await app.locals.storeSession(account, {
            ...session,
            socketId: socket.id,
        });

        next();
    };
}

export function logRequest(req: Request, res: Response, next: NextFunction) {
    req.app.locals.logger.info({
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
    req.app.locals.logger.error({
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
    encryption: Lib.crypto.KeyPair;
    signing: Lib.crypto.KeyPair;
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
