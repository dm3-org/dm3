import * as Lib from 'dm3-lib';
import express from 'express';
import { deletePending, getPending, RedisPrefix } from './redis';
import { auth } from './utils';
import cors from 'cors';

const router = express.Router();

//TODO remove
router.use(cors());
router.param('address', auth);

router.get(
    '/messages/:address/contact/:contact_address',
    async (req, res, next) => {
        try {
            const account = Lib.formatAddress(req.params.address);
            const contact = Lib.formatAddress(req.params.contact_address);

            const newMessages = await Lib.Delivery.getMessages(
                async (
                    conversationId: string,
                    offset: number,
                    size: number,
                ) => {
                    if (req.app.locals.redisClient) {
                        return (
                            (await req.app.locals.redisClient.exists(
                                RedisPrefix.Conversation + conversationId,
                            ))
                                ? await req.app.locals.redisClient.zRange(
                                      RedisPrefix.Conversation + conversationId,
                                      offset,
                                      offset + size,
                                      { REV: true },
                                  )
                                : []
                        ).map((envelopString: string) =>
                            JSON.parse(envelopString),
                        );
                    } else {
                        throw Error('db not connected');
                    }
                },
                account,
                contact,
            );

            res.json(newMessages);
        } catch (e) {
            next(e);
        }
    },
);

router.post('/messages/:address/pending', async (req, res, next) => {
    try {
        const account = Lib.formatAddress(req.params.address);

        const pending = await getPending(account, req.app.locals.redisClient);
        await deletePending(account, req.app.locals.redisClient);
        res.json(pending);
    } catch (e) {
        next(e);
    }
});

router.post(
    '/messages/:address/syncAcknoledgment/:last_message_pull',
    async (req, res, next) => {
        try {
            const account = Lib.formatAddress(req.params.address);
            await Promise.all(
                req.body.acknoledgments.map(
                    async (ack: Lib.Delivery.Acknoledgment) => {
                        const conversationId = Lib.getConversationId(
                            account,
                            ack.contactAddress,
                        );

                        if (req.app.locals.redisClient) {
                            const redisKey =
                                RedisPrefix.Conversation +
                                conversationId +
                                ':sync';

                            await req.app.locals.redisClient.hSet(
                                redisKey,
                                account,
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

                                const deletedMessagesCounter =
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

export default router;
