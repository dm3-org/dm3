import { getUserProfile, submitUserProfile } from '@dm3-org/dm3-lib-delivery';
import { normalizeEnsName, schema } from '@dm3-org/dm3-lib-profile';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import express from 'express';
import { ethers } from 'ethers';
import { Server } from 'socket.io';
import { IDatabase } from './persistence/getDatabase';

export default (
    db: IDatabase,
    web3Provider: ethers.providers.JsonRpcProvider,
    io: Server,
    serverSecret: string,
) => {
    const router = express.Router();

    router.get('/:ensName', async (req: express.Request, res, next) => {
        try {
            const ensName = normalizeEnsName(req.params.ensName);

            const profile = await getUserProfile(db.getSession, ensName);
            if (profile) {
                res.json(profile);
            } else {
                res.sendStatus(404);
            }
        } catch (e) {
            next(e);
        }
    });

    router.post('/:ensName', async (req: express.Request, res, next) => {
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
                web3Provider,
                db.getSession,
                db.setSession,
                ensName,
                req.body,
                serverSecret,
            );
            global.logger.debug({
                message: 'POST profile',
                ensName,
                data,
            });

            res.json(data);
        } catch (e) {
            console.error('POST PROFILE ERROR', e);

            // eslint-disable-next-line no-console
            console.log('POST PROFILE ERROR', e);
            res.status(400).send({
                message: `Couldn't store profile`,
                error: JSON.stringify(e),
            });
        }
    });

    return router;
};
