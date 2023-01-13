import * as Lib from 'dm3-lib/dist.backend';
import { isAddress } from 'ethers/lib/utils';

import express from 'express';
import { WithLocals } from './types';

const getProfileSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
    },
    required: ['ensName'],
    additionalProperties: false,
};

export default () => {
    const router = express.Router();

    router.get(
        '/:ensName',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const ensName = Lib.account.normalizeEnsName(
                    req.params.ensName,
                );

                const profile = await Lib.delivery.getUserProfile(
                    req.app.locals.db.getSession,
                    ensName,
                );
                if (profile) {
                    res.json(profile);
                } else {
                    res.sendStatus(404);
                }
            } catch (e) {
                next(e);
            }
        },
    );

    router.post(
        '/:ensName',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const schemaIsValid = Lib.validateSchema(
                    Lib.account.schema.SignedUserProfile,
                    req.body,
                );

                if (!schemaIsValid) {
                    return res.status(400).send({ error: 'invalid schema' });
                }
                const ensName = Lib.account.normalizeEnsName(
                    req.params.ensName,
                );
                res.json(
                    await Lib.delivery.submitUserProfile(
                        req.app.locals.web3Provider,
                        req.app.locals.db.getSession,
                        req.app.locals.db.setSession,
                        ensName,
                        req.body,
                        (ensName: string) =>
                            req.app.locals.db.getPending(ensName),
                        (socketId: string) =>
                            req.app.locals.io.sockets
                                .to(socketId)
                                .emit('joined'),
                    ),
                );
            } catch (e) {
                next(e);
            }
        },
    );
    return router;
};
