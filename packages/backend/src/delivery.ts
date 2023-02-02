import cors from 'cors';
import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import { RedisPrefix } from './persistance/getDatabase';
import { WithLocals } from './types';
import { auth } from './utils';

const syncAcknoledgmentParamsSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
        last_message_pull: { type: 'string' },
    },
    required: ['ensName', 'last_message_pull'],
    additionalProperties: false,
};
const syncAcknoledgmentBodySchema = {
    type: 'object',
    properties: {
        acknoledgments: {
            type: 'array',
            items: Lib.delivery.schema.AcknoledgmentSchema,
        },
    },
    required: ['acknoledgments'],
    additionalProperties: false,
};

export default () => {
    const router = express.Router();
    //TODO remove
    router.use(cors());
    router.param('ensName', auth);

    router.get(
        '/messages/:ensName/contact/:contactEnsName',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const idEnsName = await req.app.locals.db.getIdEnsName(
                    req.params.ensName,
                );
                const idContactEnsName = await req.app.locals.db.getIdEnsName(
                    req.params.contactEnsName,
                );

                const newMessages = await Lib.delivery.getMessages(
                    req.app.locals.db.getMessages,
                    req.app.locals.keys.encryption,
                    idEnsName,
                    idContactEnsName,
                );

                res.json(newMessages);
            } catch (e) {
                next(e);
            }
        },
    );

    router.post('/messages/:ensName/pending', async (req, res, next) => {
        try {
            const account = await req.app.locals.db.getIdEnsName(
                req.params.ensName,
            );

            const pending = await req.app.locals.db.getPending(
                account,
                req.app.locals.redisClient,
            );
            await req.app.locals.db.deletePending(
                account,
                req.app.locals.redisClient,
            );
            res.json(pending);
        } catch (e) {
            next(e);
        }
    });

    router.post(
        '/messages/:ensName/syncAcknoledgment/:last_message_pull',
        async (req, res, next) => {
            const hasValidParams = Lib.validateSchema(
                syncAcknoledgmentParamsSchema,
                req.params,
            );

            const hasValidBody = Lib.validateSchema(
                syncAcknoledgmentBodySchema,
                req.body,
            );

            // eslint-disable-next-line max-len
            //Express transform number inputs into strings. So we have to check if a string used as last_message_pull can be converted to a number later on.
            const isLastMessagePullNumber = !isNaN(
                Number.parseInt(req.params.last_message_pull),
            );

            if (!hasValidParams || !isLastMessagePullNumber || !hasValidBody) {
                return res.send(400);
            }

            try {
                const ensName = await req.app.locals.db.getIdEnsName(
                    req.params.ensName,
                );

                await Promise.all(
                    req.body.acknoledgments.map(
                        async (ack: Lib.delivery.Acknoledgment) => {
                            const contactEnsName =
                                await await req.app.locals.db.getIdEnsName(
                                    ack.contactAddress,
                                );
                            const conversationId =
                                Lib.storage.getConversationId(
                                    ensName,
                                    contactEnsName,
                                );

                            if (req.app.locals.redisClient) {
                                const redisKey =
                                    RedisPrefix.Conversation +
                                    conversationId +
                                    ':sync';

                                await req.app.locals.redisClient.hSet(
                                    redisKey,
                                    ensName,
                                    req.params.last_message_pull,
                                );

                                const syncTimestamps: string[] = Object.values(
                                    await req.app.locals.redisClient.hGetAll(
                                        redisKey,
                                    ),
                                );

                                // TODO: check if both using this delivery service
                                if (syncTimestamps.length === 2) {
                                    const lowestTimestamp =
                                        parseInt(syncTimestamps[0]) >
                                        parseInt(syncTimestamps[1])
                                            ? parseInt(syncTimestamps[1])
                                            : parseInt(syncTimestamps[0]);

                                    await req.app.locals.redisClient.zRemRangeByScore(
                                        RedisPrefix.Conversation +
                                            conversationId,
                                        0,
                                        lowestTimestamp,
                                    );
                                }
                            } else {
                                throw Error('db not connected');
                            }
                        },
                    ),
                );

                res.json();
            } catch (e) {
                next(e);
            }
        },
    );
    return router;
};
