import * as Lib from 'ens-mail-lib';
import express from 'express';
import { getUserStorage, setUserStorage } from './redis';
import { auth } from './utils';
import cors from 'cors';

const router = express.Router();

//TODO remove
router.use(cors());
router.param('address', auth);

router.post('/:address', async (req, res, next) => {
    try {
        const account = Lib.formatAddress(req.params.address);

        await setUserStorage(
            account,
            JSON.stringify(req.body),
            req.app.locals.redisClient,
        );

        res.json({
            timestamp: new Date().getTime(),
        });
    } catch (e) {
        next(e);
    }
});

router.get('/:address', async (req, res, next) => {
    try {
        const account = Lib.formatAddress(req.params.address);

        res.json(await getUserStorage(account, req.app.locals.redisClient));
    } catch (e) {
        next(e);
    }
});

export default router;
