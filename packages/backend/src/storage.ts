import cors from 'cors';
import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import stringify from 'safe-stable-stringify';
import { WithLocals } from './types';
import { auth } from './utils';

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());
    router.param('ensName', auth);

    router.get(
        '/:ensName',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const account = Lib.account.normalizeEnsName(
                    req.params.ensName,
                );
                const userStorage = await req.app.locals.db.getUserStorage(
                    account,
                );
                return res.json(userStorage);
            } catch (e) {
                next(e);
            }
        },
    );

    router.post(
        '/:ensName',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const account = Lib.account.normalizeEnsName(
                    req.params.ensName,
                );

                await req.app.locals.db.setUserStorage(
                    account,
                    stringify(req.body),
                );

                res.json({
                    timestamp: new Date().getTime(),
                });
            } catch (e) {
                next(e);
            }
        },
    );

    return router;
};
