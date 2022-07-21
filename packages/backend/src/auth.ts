import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import cors from 'cors';

const router = express.Router();

//TODO remove
router.use(cors());

router.get('/:address', async (req, res, next) => {
    try {
        const account = Lib.formatAddress(req.params.address);

        const challenge = await Lib.Delivery.createChallenge(
            req.app.locals.loadSession,
            req.app.locals.storeSession,
            account,
        );

        res.json({
            challenge,
        });
    } catch (e) {
        next(e);
    }
});

router.post('/:address', async (req, res, next) => {
    try {
        const account = Lib.formatAddress(req.params.address);

        const token = await Lib.Delivery.createNewSessionToken(
            req.app.locals.loadSession,
            req.app.locals.storeSession,
            req.body.signature,
            account,
        );

        res.json({
            token,
        });
    } catch (e) {
        next(e);
    }
});

export default router;
