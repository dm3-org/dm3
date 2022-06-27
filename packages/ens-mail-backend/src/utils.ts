import * as Lib from 'ens-mail-lib';
import { NextFunction, Response, Request } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { Express } from 'express';

export async function auth(
    req: Request,
    res: Response,
    next: NextFunction,
    address: string,
) {
    const account = Lib.formatAddress(address);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (
        token &&
        (await Lib.Delivery.checkToken(
            req.app.locals.loadSession,
            account,
            token,
        ))
    ) {
        next();
    } else {
        res.sendStatus(401);
    }
}

export function socketAuth(app: Express) {
    return async (
        socket: Socket,
        next: (err?: ExtendedError | undefined) => void,
    ) => {
        const account = Lib.formatAddress(
            socket.handshake.auth.account.address as string,
        );

        if (
            !(await Lib.Delivery.checkToken(
                app.locals.loadSession,
                account,
                socket.handshake.auth.token as string,
            ))
        ) {
            Lib.log(`[WS] Account ${account}: REJECTED`);
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

        Lib.log(`[WS] Account ${account} with id ${socket.id}: CONNECTED`);
        next();
    };
}
