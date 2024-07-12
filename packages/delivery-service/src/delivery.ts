import { getMessages, schema } from '@dm3-org/dm3-lib-delivery';
import { DeliveryServiceProfileKeys } from '@dm3-org/dm3-lib-profile';
import { auth } from '@dm3-org/dm3-lib-server-side';
import cors from 'cors';
import { ethers } from 'ethers';
import express from 'express';
import { IDatabase } from './persistence/getDatabase';

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
        auth(req, res, next, ensName, db, web3Provider, serverSecret);
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
                    10,
                );
                res.json(incomingMessages);
            } catch (e) {
                next(e);
            }
        },
    );
    return router;
};
