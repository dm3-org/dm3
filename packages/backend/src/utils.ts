import * as Lib from 'dm3-lib/dist.backend';
import { NextFunction, Response, Request } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { Express } from 'express';
import winston from 'winston';

export async function auth(
    req: Request,
    res: Response,
    next: NextFunction,
    address: string,
) {
    const account = Lib.external.formatAddress(address);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (
        token &&
        (await Lib.delivery.checkToken(
            req.app.locals.loadSession,
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
        const account = Lib.external.formatAddress(
            socket.handshake.auth.account.address as string,
        );
        app.locals.logger.info({
            method: 'WS CONNECT',
            account,
            socketId: socket.id,
        });

        if (
            !(await Lib.delivery.checkToken(
                app.locals.loadSession,
                account,
                socket.handshake.auth.token as string,
            ))
        ) {
            return next(new Error('invalid username'));
        }
        const session = await app.locals.loadSession(account);
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
