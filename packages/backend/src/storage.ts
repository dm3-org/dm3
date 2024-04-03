import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import cors from 'cors';
import express from 'express';
import stringify from 'safe-stable-stringify';
import { auth } from '@dm3-org/dm3-lib-server-side';
import { sha256 } from '@dm3-org/dm3-lib-shared';
import { IDatabase } from './persistence/getDatabase';

export default (db: IDatabase) => {
    const router = express.Router();

    //TODO remove
    router.use(cors());
    router.param('ensName', auth);

    router.post('/new/:ensName/editMessageBatch', async (req, res, next) => {
        const { encryptedContactName, editMessageBatchPayload } = req.body;

        if (
            !encryptedContactName ||
            !editMessageBatchPayload ||
            !Array.isArray(editMessageBatchPayload)
        ) {
            res.status(400).send('invalid schema');
            return;
        }

        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const getUniqueMessageId = (messageId: string) =>
                sha256(ensName + messageId);
            await db.editMessageBatch(
                ensName,
                encryptedContactName,
                editMessageBatchPayload.map((message) => ({
                    messageId: getUniqueMessageId(message.messageId),
                    encryptedEnvelopContainer:
                        message.encryptedEnvelopContainer,
                })),
            );
            return res.send();
        } catch (e) {
            next(e);
        }
    });

    router.post('/new/:ensName/addMessage', async (req, res, next) => {
        const { encryptedEnvelopContainer, encryptedContactName, messageId } =
            req.body;

        if (!encryptedEnvelopContainer || !encryptedContactName || !messageId) {
            res.status(400).send('invalid schema');
            return;
        }

        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const uniqueMessageId = sha256(ensName + messageId);
            const success = await db.addMessageBatch(
                ensName,
                encryptedContactName,
                [{ messageId: uniqueMessageId, encryptedEnvelopContainer }],
            );
            if (success) {
                return res.send();
            }
            res.status(400).send('unable to add message');
        } catch (e) {
            next(e);
        }
    });
    router.post('/new/:ensName/addMessageBatch', async (req, res, next) => {
        const { messageBatch, encryptedContactName } = req.body;

        if (
            !messageBatch ||
            !Array.isArray(messageBatch) ||
            !encryptedContactName
        ) {
            res.status(400).send('invalid schema');
            return;
        }

        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const getUniqueMessageId = (messageId: string) =>
                sha256(ensName + messageId);

            await db.addMessageBatch(
                ensName,
                encryptedContactName,
                messageBatch.map((message) => ({
                    messageId: getUniqueMessageId(message.messageId),
                    encryptedEnvelopContainer:
                        message.encryptedEnvelopContainer,
                })),
            );
            return res.send();
        } catch (e) {
            return res.status(400).send('unable to add message batch');
        }
    });

    router.get(
        '/new/:ensName/getMessages/:encryptedContactName/:page',
        async (req, res, next) => {
            const pageNumber = parseInt(req.params.page);
            const encryptedContactName = req.params.encryptedContactName;

            if (isNaN(pageNumber) || !encryptedContactName) {
                res.status(400).send('invalid schema');
                return;
            }
            try {
                const ensName = normalizeEnsName(req.params.ensName);
                const messages = await db.getMessagesFromStorage(
                    ensName,
                    encryptedContactName,
                    pageNumber,
                );
                return res.json(messages);
            } catch (e) {
                next(e);
            }
        },
    );
    router.get(
        '/new/:ensName/getNumberOfMessages/:encryptedContactName',
        async (req, res, next) => {
            const encryptedContactName = req.params
                .encryptedContactName as string;

            if (!encryptedContactName) {
                res.status(400).send('invalid schema');
                return;
            }
            try {
                const ensName = normalizeEnsName(req.params.ensName);
                const messages = await db.getNumberOfMessages(
                    ensName,
                    encryptedContactName,
                );
                return res.json(messages);
            } catch (e) {
                next(e);
            }
        },
    );

    router.post('/new/:ensName/addConversation', async (req, res, next) => {
        const { encryptedContactName } = req.body;
        if (!encryptedContactName) {
            res.status(400).send('invalid schema');
            return;
        }
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const success = await db.addConversation(
                ensName,
                encryptedContactName,
            );
            if (success) {
                return res.send();
            }
            res.status(400).send('unable to add conversation');
        } catch (e) {
            next(e);
        }
    });
    router.get('/new/:ensName/getConversations', async (req, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const conversations = await db.getConversationList(ensName);
            return res.json(conversations);
        } catch (e) {
            next(e);
        }
    });
    router.get(
        '/new/:ensName/getNumberOfConversations',
        async (req, res, next) => {
            try {
                const ensName = normalizeEnsName(req.params.ensName);
                const messages = await db.getNumberOfConverations(ensName);
                return res.json(messages);
            } catch (e) {
                next(e);
            }
        },
    );

    router.post(
        '/new/:ensName/toggleHideConversation',
        async (req, res, next) => {
            const { encryptedContactName, hide } = req.body;
            if (!encryptedContactName) {
                res.status(400).send('invalid schema');
                return;
            }
            try {
                const ensName = normalizeEnsName(req.params.ensName);

                await db.toggleHideConversation(
                    ensName,
                    encryptedContactName,
                    hide,
                );
                return res.send();
            } catch (e) {
                return res
                    .status(400)
                    .send('unable to toggle hide-conversation');
            }
        },
    );

    router.get('/new/:ensName/migrationStatus', async (req, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const status = await db.getUserDbMigrationStatus(ensName);
            return res.json(status);
        } catch (e) {
            next(e);
        }
    });

    router.post('/new/:ensName/migrationStatus', async (req, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            await db.setUserDbMigrated(ensName);
            return res.send();
        } catch (e) {
            next(e);
        }
    });

    router.get('/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);
            const userStorage = await db.getUserStorage(account);
            return res.json(userStorage);
        } catch (e) {
            next(e);
        }
    });

    router.post('/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);

            await db.setUserStorage(account, stringify(req.body)!);

            res.json({
                timestamp: new Date().getTime(),
            });
        } catch (e) {
            next(e);
        }
    });

    return router;
};
