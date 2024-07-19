import { Acknowledgment, getMessages, schema } from '@dm3-org/dm3-lib-delivery';
import { auth } from '@dm3-org/dm3-lib-server-side';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { getConversationId } from '@dm3-org/dm3-lib-delivery';
import cors from 'cors';
import { ethers } from 'ethers';
import express from 'express';
import { IDatabase } from './persistence/getDatabase';
import { DeliveryServiceProfileKeys } from '@dm3-org/dm3-lib-profile';

const syncAcknowledgementParamsSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
    },
    required: ['ensName'],
    additionalProperties: false,
};
const syncAcknowledgementBodySchema = {
    type: 'object',
    properties: {
        acknowledgments: {
            type: 'array',
            items: schema.Acknowledgment,
        },
    },
    required: ['acknowledgments'],
    additionalProperties: false,
};

export default (
    web3Provider: ethers.providers.JsonRpcProvider,
    db: IDatabase,
    keys: DeliveryServiceProfileKeys,
    serverSecret: string,
) => {
    const router = express.Router();
    //TODO remove
    router.use(cors());
    router.param('ensName', async (req, res, next, ensName: string) => {
        auth(
            req,
            res,
            next,
            ensName,
            db.hasAccount,
            web3Provider,
            serverSecret,
        );
    });
    //Returns all incoming messages for a specific contact name
    router.get(
        '/messages/:ensName/contact/:contactEnsName',
        async (req: express.Request, res, next) => {
            try {
                const idEnsName = await db.getIdEnsName(req.params.ensName);

                const idContactEnsName = await db.getIdEnsName(
                    req.params.contactEnsName,
                );

                const newMessages = await getMessages(
                    db.getMessages,
                    keys.encryptionKeyPair,
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
     * @param {express.Request} req - The request object, including the ENS name as a parameter
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
        async (req: express.Request, res, next) => {
            try {
                const incomingMessages = await db.getIncomingMessages(
                    req.params.ensName,
                    //Fetch the last 10 messages per conversation
                    //If we decide to add pagination for that endpoint we can pass this value as a param
                    1000,
                );
                res.json(incomingMessages);
            } catch (e) {
                next(e);
            }
        },
    );
    router.post(
        '/messages/:ensName/syncAcknowledgments/',
        async (req, res, next) => {
            const hasValidParams = validateSchema(
                syncAcknowledgementParamsSchema,
                req.params,
            );

            const hasValidBody = validateSchema(
                syncAcknowledgementBodySchema,
                req.body,
            );
            if (!hasValidParams || !hasValidBody) {
                console.error('sync acknowledgements invalid schema');
                return res.sendStatus(400);
            }

            try {
                const ensName = await db.getIdEnsName(req.params.ensName);
                console.log('lets go');

                await Promise.all(
                    req.body.acknowledgments.map(
                        async (ack: Acknowledgment) => {
                            const contactEnsName = await db.getIdEnsName(
                                ack.contactAddress,
                            );
                            const conversationId = getConversationId(
                                ensName,
                                contactEnsName,
                            );

                            await db.syncAcknowledge(
                                conversationId,
                                ack.messageHash,
                            );
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
