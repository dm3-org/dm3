import * as Lib from 'ens-mail-lib';
import express from 'express';
import cors from 'cors';

const router = express.Router();

//TODO remove
router.use(cors());

router.get('/:address', async (req, res) => {
    const account = Lib.formatAddress(req.params.address);
    Lib.log(`[auth] Get challenge for ${account}`);

    const challenge = await Lib.Delivery.createChallenge(
        req.app.locals.loadSession,
        req.app.locals.storeSession,
        account,
    );

    res.json({
        challenge,
    });
});

router.post('/:address', async (req, res) => {
    const account = Lib.formatAddress(req.params.address);
    Lib.log(`[auth] New token requested for ${account}`);

    const token = await Lib.Delivery.createNewSessionToken(
        req.app.locals.loadSession,
        req.app.locals.storeSession,
        req.body.signature,
        account,
    );

    res.json({
        token,
    });
});

export default router;
