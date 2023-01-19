import * as Lib from 'dm3-lib/dist.backend';
import { isAddress } from 'ethers/lib/utils';

import express from 'express';
import { WithLocals } from './types';

const getProfileSchema = {
    type: 'object',
    properties: {
        address: { type: 'string' },
    },
    required: ['address'],
    additionalProperties: false,
};

export default () => {
    const router = express.Router();

    router.get(
        '/:address',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const schemaIsValid = Lib.validateSchema(
                    getProfileSchema,
                    req.params,
                );

                if (!schemaIsValid || !isAddress(req.params.address)) {
                    return res.status(400).send({ error: 'invalid schema' });
                }
                const profile = await Lib.delivery.getUserProfile(
                    req.app.locals.db.getSession,
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
        },
    );

    router.post(
        '/:address',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const schemaIsValid = Lib.validateSchema(
                    getProfileSchema,
                    req.params,
                );

                if (!schemaIsValid || !isAddress(req.params.address)) {
                    return res.status(400).send({ error: 'invalid schema' });
                }
                const account = Lib.external.formatAddress(req.params.address);
                res.json(
                    await Lib.delivery.submitUserProfile(
                        req.app.locals.db.getSession,
                        req.app.locals.db.setSession,
                        account,
                        req.body,
                        (accountAddress: string) =>
                            req.app.locals.db.getPending(accountAddress),
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
