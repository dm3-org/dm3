import { validateSchema } from 'dm3-lib-shared';
import { createChallenge, createNewSessionToken } from 'dm3-lib-delivery';

import express from 'express';
import cors from 'cors';
import { WithLocals } from './types';

const getChallengeSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
    },
    required: ['ensName'],
    additionalProperties: false,
};

const createNewSessionTokenParamsSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
    },
    required: ['ensName'],
    additionalProperties: false,
};

const createNewSessionTokenBodySchema = {
    type: 'object',
    properties: {
        signature: { type: 'string' },
    },
    required: ['signature'],
    additionalProperties: false,
};

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());

    router.get(
        '/:ensName',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const idEnsName = await req.app.locals.db.getIdEnsName(
                    req.params.ensName,
                );

                const schemaIsValid = validateSchema(
                    getChallengeSchema,
                    req.params,
                );

                if (!schemaIsValid) {
                    return res.send(400);
                }

                const challenge = await createChallenge(
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    idEnsName,
                );

                res.json({
                    challenge,
                });
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
                const idEnsName = await req.app.locals.db.getIdEnsName(
                    req.params.ensName,
                );
                const paramsAreValid = validateSchema(
                    createNewSessionTokenParamsSchema,
                    req.params,
                );

                const bodyIsValid = validateSchema(
                    createNewSessionTokenBodySchema,
                    req.body,
                );

                const schemaIsValid = paramsAreValid && bodyIsValid;

                if (!schemaIsValid) {
                    return res.send(400);
                }

                const token = await createNewSessionToken(
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    req.body.signature,
                    idEnsName,
                );

                res.json({
                    token,
                });
            } catch (e) {
                next(e);
            }
        },
    );

    return router;
};
