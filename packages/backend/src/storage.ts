import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import { getUserStorage, setUserStorage } from './redis';
import { auth } from './utils';
import cors from 'cors';
import stringify from 'safe-stable-stringify';

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());
    router.param('address', auth);

    router.get('/:address', async (req, res, next) => {
        try {
            const account = Lib.external.formatAddress(req.params.address);

            res.json(await getUserStorage(account, req.app.locals.redisClient));
        } catch (e) {
            next(e);
        }
    });

    router.post('/:address', async (req, res, next) => {
        try {
            const account = Lib.external.formatAddress(req.params.address);

            await setUserStorage(
                account,
                stringify(req.body),
                req.app.locals.redisClient,
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
