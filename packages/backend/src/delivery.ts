import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import { deletePending, getPending, RedisPrefix } from './redis';
import { auth } from './utils';
import cors from 'cors';
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';

const getMessagesSchema = {
    type: 'object',
    properties: {
        address: { type: 'string' },
        contact_address: { type: 'string' },
    },
    required: ['address', 'contact_address'],
    additionalProperties: false,
};

const syncAcknoledgmentParamsSchema = {
    type: 'object',
    properties: {
        address: { type: 'string' },
        last_message_pull: { type: 'string' },
    },
    required: ['address', 'last_message_pull'],
    additionalProperties: false,
};
const syncAcknoledgmentBodySchema = {
    type: 'object',
    properties: {
        acknoledgments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    contactAddress: { type: 'string' },
                    messageDeliveryServiceTimestamp: { type: 'number' },
                },
                required: ['contactAddress', 'messageDeliveryServiceTimestamp'],
                additionalProperties: false,
            },
        },
    },
    required: ['acknoledgments'],
    additionalProperties: false,
};

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());
    router.param('address', auth);

    router.get(
        '/messages/:address/contact/:contact_address',
        async (req, res, next) => {
            try {
                const { address, contact_address } = req.params;

                const isSchemaValid = Lib.validateSchema(
                    getMessagesSchema,
                    req.params,
                );
                if (
                    !(
                        isSchemaValid &&
                        isAddress(address) &&
                        isAddress(contact_address)
                    )
                ) {
                    return res.send(400);
                }

                const account = Lib.external.formatAddress(address);
                const contact = Lib.external.formatAddress(
                    req.params.contact_address,
                );

                const newMessages = await Lib.delivery.getMessages(
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
                                          RedisPrefix.Conversation +
                                              conversationId,
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
            const account = Lib.external.formatAddress(req.params.address);

            const pending = await getPending(
                account,
                req.app.locals.redisClient,
            );
            await deletePending(account, req.app.locals.redisClient);
            res.json(pending);
        } catch (e) {
            console.log(e);
            next(e);
        }
    });

    router.post(
        '/messages/:address/syncAcknoledgment/:last_message_pull',
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
                const account = Lib.external.formatAddress(req.params.address);
                await Promise.all(
                    req.body.acknoledgments.map(
                        async (ack: Lib.delivery.Acknoledgment) => {
                            const conversationId =
                                Lib.storage.getConversationId(
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
                console.log(e);
                next(e);
            }
        },
    );
    return router;
};
