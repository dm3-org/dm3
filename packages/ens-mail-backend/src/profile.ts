import * as Lib from 'ens-mail-lib';

import express from 'express';
import { getPending } from './redis';

const router = express.Router();

router.get('/:address', async (req, res, next) => {
    try {
        const profile = await Lib.Delivery.getProfileRegistryEntry(
            req.app.locals.loadSession,
            req.params.address,
        );
        if (profile) {
            res.json(profile);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

router.post('/:address', async (req, res, next) => {
    try {
        const account = Lib.formatAddress(req.params.address);
        res.json(
            await Lib.Delivery.submitProfileRegistryEntry(
                req.app.locals.loadSession,
                req.app.locals.storeSession,
                account,
                req.body,
                (accountAddress: string) =>
                    getPending(accountAddress, req.app.locals.redisClient),
                (socketId: string) =>
                    req.app.locals.io.sockets.to(socketId).emit('joined'),
            ),
        );
    } catch (e) {
        next(e);
    }
});

export default router;
