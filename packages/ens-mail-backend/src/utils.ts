import * as Lib from 'ens-mail-lib';
import { NextFunction, Response, Request } from 'express';

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
