import express from 'express';
import { handleAddr } from './handler/handleAddr';
import { handleText } from './handler/resolveText';
export async function handleCcipRequest(
    req: express.Request,
    res: express.Response,
    signature: string,
    request: any,
) {
    switch (signature) {
        case 'text(bytes32,string)':
            return await handleText(res, req.app.locals.db, request);
        case 'addr(bytes32)':
            return await handleAddr(res, req.app.locals.db, request);

        default:
            res.status(400).send({ message: `${signature} is not supported` });
    }
}
