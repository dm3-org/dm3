import * as Lib from 'dm3-lib/dist.backend';
import 'dotenv/config';
import express from 'express';
import { WithLocals } from '../../types';

export async function handleSubmitMessage(
    req: express.Request & { app: WithLocals },
    res: express.Response,
    next: express.NextFunction,
) {
    const {
        params: [stringifiedEnvelop, token],
    } = req.body;

    const envelop = JSON.parse(stringifiedEnvelop);

    if (!envelop || !token) {
        return res.send(400);
    }

    const submitMessageSchema = {
        type: 'object',
        properties: {
            token: { type: 'string' },
            envelop: Lib.messaging.schema.EncryptionEnvelopeSchema,
        },
        required: ['token', 'envelop'],
        additionalProperties: false,
    };

    const isSchemaValid = Lib.validateSchema(submitMessageSchema, {
        envelop,
        token,
    });

    if (!isSchemaValid) {
        const error = 'invalid schema';

        req.app.locals.logger.warn({
            method: 'WS SUBMIT MESSAGE',
            error,
        });
        return res.status(400).send({ error });
    }

    try {
        await Lib.delivery.incomingMessage(
            { envelop, token },
            req.app.locals.keys.signing,
            req.app.locals.keys.encryption,
            req.app.locals.deliveryServiceProperties.sizeLimit,
            req.app.locals.loadSession,
            req.app.locals.db.createMessage,
            (socketId: string, envelop: Lib.messaging.EncryptionEnvelop) => {
                req.app.locals.io.sockets.to(socketId).emit('message', envelop);
            },
        );
        res.send(200);
    } catch (error) {
        req.app.locals.logger.warn({
            method: 'RPC SUBMIT MESSAGE',
            error,
        });

        return res.send(400);
    }
}
