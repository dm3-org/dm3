import {
    getUserProfile,
    submitUserProfile,
    submitUserProfileSiwe,
} from '@dm3-org/dm3-lib-delivery';
import { normalizeEnsName, schema } from '@dm3-org/dm3-lib-profile';
import { schema as dsSchema } from '@dm3-org/dm3-lib-delivery';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import express, { NextFunction } from 'express';
import { WithLocals } from './types';
import { auth } from './utils';
import { getAliasChain } from './persistence/getIdEnsName';

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

    router.get(
        '/aliasChain/:ensName',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const chain = await req.app.locals.db.getAliasChain(
                    req.params.ensName,
                );

                if (chain.length > 0) {
                    res.json(chain);
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
                    global.logger.error({ message: 'invalid schema' });
                    return res.status(400).send({ error: 'invalid schema' });
                }
                const ensName = normalizeEnsName(req.params.ensName);
                global.logger.debug({
                    method: 'POST',
                    url: req.url,
                    ensName,
                    disableSessionCheck:
                        process.env.DISABLE_SESSION_CHECK === 'true',
                });

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
                global.logger.debug({
                    message: 'POST profile',
                    ensName,
                    data,
                });

                res.json(data);
            } catch (e) {
                global.logger.warn({
                    message: 'POST profile',
                    error: JSON.stringify(e),
                });
                // eslint-disable-next-line no-console
                console.log('POST PROFILE ERROR', e);
                res.status(400).send({
                    message: `Couldn't store profile`,
                    error: JSON.stringify(e),
                });
            }
        },
    );
    router.post(
        '/siwe/:ensName',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const schemaIsValid = validateSchema(
                    dsSchema.SiwePayload,
                    req.body,
                );

                if (!schemaIsValid) {
                    global.logger.error({ message: 'invalid schema' });
                    return res.status(400).send({ error: 'invalid schema' });
                }
                const ensName = normalizeEnsName(req.params.ensName);

                const data = await submitUserProfileSiwe(
                    req.app.locals.web3Provider,
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    ensName,
                    req.body,
                    (ensName: string) => req.app.locals.db.getPending(ensName),
                    (socketId: string) =>
                        req.app.locals.io.sockets.to(socketId).emit('joined'),
                );
                global.logger.debug({
                    message: 'POST profile',
                    ensName,
                    data,
                });

                res.json(data);
            } catch (e) {
                global.logger.warn({
                    message: 'POST profile',
                    error: JSON.stringify(e),
                });
                // eslint-disable-next-line no-console
                console.log('POST PROFILE ERROR', e);
                res.status(400).send({
                    message: `Couldn't store profile`,
                    error: JSON.stringify(e),
                });
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
