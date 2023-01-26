import * as Lib from 'dm3-lib/dist.backend';
import 'dotenv/config';
import express from 'express';
import { WithLocals } from '../../types';

export async function handleSubmitMessage(
    req: express.Request & { app: WithLocals },
    res: express.Response,
    next: express.NextFunction,
) {
    // get parameters from request body
    const {
        params: [stringifiedEnvelop, token],
    } = req.body;

    // parse envelop parameter
    const envelop = JSON.parse(stringifiedEnvelop);

    // if envelop or token are missing, return error
    if (!envelop || !token) {
        return res.send(400);
    }

    // validate schema
    const isSchemaValid = Lib.validateSchema(
        Lib.delivery.schema.MessageSubmission,
        {
            envelop,
            token,
        },
    );

    // if schema is invalid, return error
    if (!isSchemaValid) {
        const error = 'invalid schema';

        req.app.locals.logger.warn({
            method: 'WS SUBMIT MESSAGE',
            error,
        });
        return res.status(400).send({ error });
    }

    // try to deliver message
    try {
        await Lib.delivery.incomingMessage(
            { envelop, token },
            req.app.locals.keys.signing,
            req.app.locals.keys.encryption,
            req.app.locals.deliveryServiceProperties.sizeLimit,
            req.app.locals.db.getSession,
            req.app.locals.db.createMessage,
            (socketId: string, envelop: Lib.messaging.EncryptionEnvelop) => {
                req.app.locals.io.sockets.to(socketId).emit('message', envelop);
            },
            req.app.locals.getWeb3Provider,
        );
        res.send(200);
    } catch (error) {
        // if delivery failed, return error
        req.app.locals.logger.warn({
            method: 'RPC SUBMIT MESSAGE',
            error,
        });

        return res.send(400);
    }
}
