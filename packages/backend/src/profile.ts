import {
    getUserProfile,
    submitUserProfile,
} from 'dm3-lib-delivery/dist.backend';
import { normalizeEnsName, schema } from 'dm3-lib-profile/dist.backend';
import { validateSchema } from 'dm3-lib-shared/dist.backend';
import express, { NextFunction } from 'express';
import { WithLocals } from './types';
import { auth } from './utils';

export default () => {
    const router = express.Router();

    router.get(
        '/:ensName',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const ensName = normalizeEnsName(req.params.ensName);

                const profile = await getUserProfile(
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
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const schemaIsValid = validateSchema(
                    schema.SignedUserProfile,
                    req.body,
                );

                if (!schemaIsValid) {
                    return res.status(400).send({ error: 'invalid schema' });
                }
                const ensName = normalizeEnsName(req.params.ensName);

                const data = await submitUserProfile(
                    req.app.locals.web3Provider,
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    ensName,
                    req.body,
                    (ensName: string) => req.app.locals.db.getPending(ensName),
                    (socketId: string) =>
                        req.app.locals.io.sockets.to(socketId).emit('joined'),
                );

                res.json(data);
            } catch (e) {
                next(e);
            }
        },
    );

    const aliasAuth = () => {
        return (
            req: express.Request & { app: WithLocals },
            res: express.Response,
            next: NextFunction,
        ) => {
            auth(req, res, next, req.params.ensName);
        };
    };

    router.post(
        '/:ensName/aka/:aliasEnsName',
        //@ts-ignore
        aliasAuth(),
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                await req.app.locals.db.setAliasSession(
                    req.params.ensName,
                    req.params.aliasEnsName,
                );
                res.json({ success: true });
            } catch (e) {
                next(e);
            }
        },
    );
    return router;
};
