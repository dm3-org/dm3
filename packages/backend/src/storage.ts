import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import { setUserStorage } from './redis';
import { auth } from './utils';
import cors from 'cors';
import stringify from 'safe-stable-stringify';
import { WithLocals } from './types';

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());
    router.param('address', auth);

    router.get(
        '/:address',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const account = Lib.external.formatAddress(req.params.address);
                const userStorage = await req.app.locals.db.getUserStorage(
                    account,
                );
                return res.json(userStorage);
            } catch (e) {
                next(e);
            }
        },
    );

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
