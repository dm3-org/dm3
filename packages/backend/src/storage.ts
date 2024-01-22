import cors from 'cors';
import express from 'express';
import stringify from 'safe-stable-stringify';
import { auth } from './utils';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());
    router.param('ensName', auth);

    router.get('/new/:ensName/:key', async (req, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);
            const userStorage = await req.app.locals.db.getUserStorageChunk(
                ensName,
                req.params.key,
            );
            return res.json(userStorage);
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
