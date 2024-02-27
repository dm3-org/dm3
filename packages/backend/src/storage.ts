import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import cors from 'cors';
import express from 'express';
import stringify from 'safe-stable-stringify';
import { auth } from './utils';

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());
    router.param('ensName', auth);

    router.post('/new/:ensName/editMessageBatch', async (req, res, next) => {
        const { encryptedContactName, editMessageBatchPayload } = req.body;

        if (!encryptedContactName || !editMessageBatchPayload) {
            res.status(400).send('invalid schema');
            return;
        }

        try {
            const ensName = normalizeEnsName(req.params.ensName);
            await req.app.locals.db.editMessageBatch(
                ensName,
                encryptedContactName,
                JSON.parse(editMessageBatchPayload),
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
            const success = await req.app.locals.db.addMessageBatch(
                ensName,
                encryptedContactName,
                [{ messageId, encryptedEnvelopContainer }],
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

            await req.app.locals.db.addMessageBatch(
                ensName,
                encryptedContactName,
                messageBatch,
            );
            return res.send();
        } catch (e) {
            return res.status(400).send('unable to add message batch');
        }
    });

    router.get('/new/:ensName/getMessages/', async (req, res, next) => {
        const pageNumber = parseInt(req.body.page);
        const encryptedContactName = req.body.encryptedContactName as string;

        if (isNaN(pageNumber) || !encryptedContactName) {
            res.status(400).send('invalid schema');
            return;
        }
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const messages = await req.app.locals.db.getMessagesFromStorage(
                ensName,
                encryptedContactName,
                pageNumber,
            );
            return res.json(messages);
        } catch (e) {
            next(e);
        }
    });
    router.get('/new/:ensName/getNumberOfMessages/', async (req, res, next) => {
        const encryptedContactName = req.body.encryptedContactName as string;

        if (!encryptedContactName) {
            res.status(400).send('invalid schema');
            return;
        }
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const messages = await req.app.locals.db.getNumberOfMessages(
                ensName,
                encryptedContactName,
            );
            return res.json(messages);
        } catch (e) {
            next(e);
        }
    });

    router.post('/new/:ensName/addConversation', async (req, res, next) => {
        const { encryptedContactName } = req.body;
        if (!encryptedContactName) {
            res.status(400).send('invalid schema');
            return;
        }
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const success = await req.app.locals.db.addConversation(
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
    router.get('/new/:ensName/conversationList', async (req, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const conversations = await req.app.locals.db.getConversationList(
                ensName,
            );
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
                const messages =
                    await req.app.locals.db.getNumberOfConverations(ensName);
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

                await req.app.locals.db.toggleHideConversation(
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

    router.get('/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);
            const userStorage = await req.app.locals.db.getUserStorage(account);
            return res.json(userStorage);
        } catch (e) {
            next(e);
        }
    });

    router.post('/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);

            await req.app.locals.db.setUserStorage(
                account,
                stringify(req.body)!,
            );

            res.json({
                timestamp: new Date().getTime(),
            });
        } catch (e) {
            next(e);
        }
    });

    return router;
};
