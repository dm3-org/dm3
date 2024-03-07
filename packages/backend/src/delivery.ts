import cors from 'cors';
import express from 'express';
import { IDatabase } from './persistence/getDatabase';
import { WithLocals } from './types';
import { auth } from './utils';
import { schema, getMessages, Acknoledgment } from '@dm3-org/dm3-lib-delivery';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { getConversationId } from '@dm3-org/dm3-lib-storage';

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
            items: schema.Acknoledgment,
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
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const idEnsName = await req.app.locals.db.getIdEnsName(
                    req.params.ensName,
                );

                const idContactEnsName = await req.app.locals.db.getIdEnsName(
                    req.params.contactEnsName,
                );

                const newMessages = await getMessages(
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

    /**
     * Retrieves incoming messages for a specific ENS name.
     *
     * @route GET /messages/incoming/:ensName
     * @param {express.Request & { app: WithLocals }} req - The request object, including the ENS name as a parameter
     * @param {express.Response} res - The response object.
     * @param {express.NextFunction} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves with the incoming messages as a JSON response.
     * @throws {Error} - If an error occurs while retrieving the incoming messages.
     *
     * @example
     * GET /messages/incoming/example.ens
     */

    router.get(
        '/messages/incoming/:ensName',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const incomingMessages =
                    await req.app.locals.db.getIncomingMessages(
                        req.params.ensName,
                        //Fetch the last 10 messages per conversation
                        //If we decide to add pagination for that endpoint we can pass this value as a param
                        10,
                    );
                res.json(incomingMessages);
            } catch (e) {
                next(e);
            }
        },
    );

    router.post('/messages/:ensName/pending', async (req, res, next) => {
        try {
            const db: IDatabase = req.app.locals.db;

            const account = await db.getIdEnsName(req.params.ensName);

            const pending = await db.getPending(account);
            await db.deletePending(account);

            res.json(pending);
        } catch (e) {
            next(e);
        }
    });
    //TODO remove after storage refactoring
    router.post(
        '/messages/:ensName/syncAcknoledgment/:last_message_pull',
        async (req, res, next) => {
            const hasValidParams = validateSchema(
                syncAcknoledgmentParamsSchema,
                req.params,
            );

            const hasValidBody = validateSchema(
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
                    req.body.acknoledgments.map(async (ack: Acknoledgment) => {
                        const contactEnsName =
                            await await req.app.locals.db.getIdEnsName(
                                ack.contactAddress,
                            );
                        const conversationId = getConversationId(
                            ensName,
                            contactEnsName,
                        );

                        const db: IDatabase = req.app.locals.db;

                        await db.syncAcknowledge(
                            conversationId,
                            Number.parseInt(req.params.last_message_pull),
                        );
                    }),
                );

                res.json();
            } catch (e) {
                next(e);
            }
        },
    );
    router.post(
        '/messages/:ensName/syncAcknowledgment/:last_message_pull',
        async (req, res, next) => {
            const hasValidParams = validateSchema(
                syncAcknoledgmentParamsSchema,
                req.params,
            );

            const hasValidBody = validateSchema(
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
                    req.body.acknoledgments.map(async (ack: Acknoledgment) => {
                        const contactEnsName =
                            await await req.app.locals.db.getIdEnsName(
                                ack.contactAddress,
                            );
                        const conversationId = getConversationId(
                            ensName,
                            contactEnsName,
                        );

                        const db: IDatabase = req.app.locals.db;

                        await db.syncAcknowledge(
                            conversationId,
                            Number.parseInt(req.params.last_message_pull),
                        );
                    }),
                );

                res.json();
            } catch (e) {
                next(e);
            }
        },
    );
    return router;
};
