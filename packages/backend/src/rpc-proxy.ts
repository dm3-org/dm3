import express from 'express';
import { Axios } from 'axios';
import 'dotenv/config';
import * as Lib from 'dm3-lib/dist.backend';
import { RedisPrefix } from './redis';

const DM3_SUBMIT_MESSAGE = 'dm3_submitMessage';

export default (axios: Axios) => {
    const router = express.Router();

    router.post('/', async (req, res, next) => {
        //RPC must be called with a method name
        if (req.body?.method === undefined) {
            return res.send(400);
        }

        const { method, params } = req.body;
        if (method === DM3_SUBMIT_MESSAGE) {
            return handleSubmitMessage(req, res, next);
        }
        return forwardToRpcNode(axios)(req, res, next);
    });
    return router;
};

const handleSubmitMessage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
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
};

const forwardToRpcNode =
    (axios: Axios) =>
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        try {
            const data = (await axios.post(process.env.RPC as string, req.body))
                .data;
            console.log('data ' + data);
            res.json(data);
        } catch (e) {
            next(e);
        }
    };
