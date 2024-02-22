import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import cors from 'cors';
import express from 'express';
import stringify from 'safe-stable-stringify';

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());

    router.post('/new/:ensName/addMessage', async (req, res, next) => {
        const { message, encryptedContactName, messageId } = req.body;
        console.log('req.body', req.body);

        if (!message || !encryptedContactName || !messageId) {
            res.status(400).send('invalid schema');
            return;
        }

        try {
            console.log('check req');
            const ensName = normalizeEnsName(req.params.ensName);
            const success = await req.app.locals.db.storage_addMessage(
                ensName,
                encryptedContactName,
                messageId,
                message,
            );
            console.log('success', success);
            if (success) {
                return res.send();
            }
            res.status(400).send('unable to add conversation');
        } catch (e) {
            next(e);
        }
    });

    router.get('/new/:ensName/getMessages', async (req, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const conversations = await req.app.locals.db.storage_getMessages(
                ensName,
            );
            console.log('conversations', conversations);
            return res.json(conversations);
        } catch (e) {
            next(e);
        }
    });

    router.post('/new/:ensName/addConversation', async (req, res, next) => {
        const { encryptedId } = req.body;
        if (!encryptedId) {
            res.status(400).send('invalid schema');
            return;
        }
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const success = await req.app.locals.db.storage_addConversation(
                ensName,
                encryptedId,
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
            const conversations =
                await req.app.locals.db.storage_getConversationList(ensName);
            console.log('conversations', conversations);
            return res.json(conversations);
        } catch (e) {
            next(e);
        }
    });

    router.post('/new/:ensName/:key', async (req, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);

            await req.app.locals.db.setUserStorageChunk(
                ensName,
                req.params.key,
                stringify(req.body)!,
            );

            res.json({
                timestamp: new Date().getTime(),
            });
        } catch (e) {
            next(e);
        }
    });

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
