import * as Lib from 'ens-mail-lib';
import express from 'express';

const router = express.Router();

router.get('/:address', async (req, res) => {
    const profile = await Lib.Delivery.getProfileRegistryEntry(
        req.app.locals.loadSession,
        req.params.address,
    );
    if (profile) {
        res.json(profile);
    } else {
        res.sendStatus(404);
    }
});

router.post('/:address', async (req, res) => {
    const account = Lib.formatAddress(req.params.address);
    res.json(
        await Lib.Delivery.submitProfileRegistryEntry(
            req.app.locals.loadSession,
            req.app.locals.storeSession,
            account,
            req.body,
            req.app.locals.pendingConversations,
            (socketId: string) =>
                req.app.locals.io.sockets.to(socketId).emit('joined'),
        ),
    );
});

export default router;
