import * as Lib from 'ens-mail-lib';
import express from 'express';
import { getUserStorage, setUserStorage } from './redis';
import { auth } from './utils';
import cors from 'cors';

const router = express.Router();

//TODO remove
router.use(cors());
router.param('address', auth);

router.post('/:address', async (req, res) => {
    const account = Lib.formatAddress(req.params.address);
    Lib.log(`[storage] User storage saved for ${account}`);

    await setUserStorage(
        account,
        JSON.stringify(req.body),
        req.app.locals.redisClient,
    );

    res.json({
        timestamp: new Date().getTime(),
    });
});

router.get('/:address', async (req, res) => {
    const account = Lib.formatAddress(req.params.address);
    Lib.log(`[storage] Get user storage for ${account}`);

    res.json(await getUserStorage(account, req.app.locals.redisClient));
});

export default router;
