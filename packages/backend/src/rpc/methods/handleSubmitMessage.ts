import * as Lib from 'dm3-lib/dist.backend';
import 'dotenv/config';
import express from 'express';
import { RedisPrefix } from '../../redis';

export async function handleSubmitMessage(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) {
    const {
        params: [envelop, token],
    } = req.body;

    if (!envelop || !token) {
        return res.send(400);
    }

    try {
        await Lib.delivery.incomingMessage(
            { envelop, token },
            req.app.locals.deliveryServicePrivateKey,
            req.app.locals.loadSession,
            async (
                conversationId: string,
                envelop: Lib.messaging.EncryptionEnvelop,
            ) => {
                if (req.app.locals.redisClient) {
                    await req.app.locals.redisClient.zAdd(
                        RedisPrefix.Conversation + conversationId,
                        {
                            score: new Date().getTime(),
                            value: JSON.stringify(envelop),
                        },
                    );
                } else {
                    throw Error('db not connected');
                }
            },
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
