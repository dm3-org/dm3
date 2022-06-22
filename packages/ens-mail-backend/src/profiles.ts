import * as Lib from 'ens-mail-lib';
import express from 'express';

const router = express.Router();

router.get('/:address', async (req, res) => {
    res.json(
        await Lib.Delivery.getProfileRegistryEntry(
            req.app.locals.loadSession,
            req.params.address,
        ),
    );
});

export default router;
